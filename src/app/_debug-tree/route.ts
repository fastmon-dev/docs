// Debug route removed. Returning 404 keeps the path inert until the file is
// physically deleted from disk.
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export function GET(): never {
  notFound();
}
