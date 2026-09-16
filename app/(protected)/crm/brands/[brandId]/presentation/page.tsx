import { notFound } from 'next/navigation';
import { loadPresentationWorkspace } from '@/feature/brand-presentation/server';
import { PresentationError } from '@/feature/brand-presentation/model';
import PresentationStudio from '@/feature/brand-presentation/components/PresentationStudio';

export default async function PresentationPage({params}:{params:Promise<{brandId:string}>}) {
  let workspace;
  try {workspace=await loadPresentationWorkspace((await params).brandId);}
  catch(error){if(error instanceof PresentationError&&error.status===404)notFound();throw error;}
  return <PresentationStudio {...workspace}/>;
}
