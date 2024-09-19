'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { sql } from '@vercel/postgres';
import { signIn } from '@/auth';
import { z } from 'zod';
import base64url from 'base64url';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// create invoice
//' prevState - contains the state passed from the useActionState hook, it's a required prop
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  
  //' It's usually good practice to store monetary values in cents in your database
  //' to eliminate JavaScript floating-point errors and ensure greater accuracy
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices')
}

// update invoice
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
   
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// delete invoice
export async function deleteInvoice(id: string) {

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

// authenticate user
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

//' WebAuthn Registration Route: route to handle WebAuthn credential registration for users.
//' The backend will generate a challenge and return it to the frontend.
//' The frontend will then collect the credential using the WebAuthn API, and the backend will validate and store it.
// export async function registerWebAuthnCredential(userId: string, attestationResponse: any) {
//   // Decode and verify attestationResponse, usually involves a WebAuthn library
//   const { id, publicKey, rawId } = attestationResponse;

//   try {
//     // Store the user's WebAuthn credential in the database
//     await sql`
//       UPDATE users
//       SET webauthnCredentialId = ${base64url.encode(id)},
//           publicKey = ${base64url.encode(publicKey)}
//       WHERE id = ${userId};
//     `;
//   } catch (error) {
//     throw new Error('Failed to register WebAuthn credential.');
//   }
// }

//' WebAuthn Authentication Route: Create another route to authenticate using the WebAuthn credential.
//' When a user attempts to log in, you need to fetch the stored publicKey and verify the user's assertion.
// export async function authenticateWithWebAuthn(userId: string, assertionResponse: any) {
//   try {
//     // Fetch the user's publicKey from the database
//     const result = await sql`SELECT publicKey FROM users WHERE id = ${userId}`;
//     const publicKey = result.rows[0]?.publicKey;

//     if (!publicKey) throw new Error('No WebAuthn credential found for user.');

//     // Verify the assertionResponse with the publicKey
//     // Use a WebAuthn library for this (e.g., webauthn-server)
//     const isValid = verifyAssertion(publicKey, assertionResponse);

//     if (!isValid) throw new Error('Failed to authenticate WebAuthn credential.');
//   } catch (error) {
//     throw new Error('WebAuthn authentication failed.');
//   }
// }