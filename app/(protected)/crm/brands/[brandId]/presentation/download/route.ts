import { preparePresentationExport } from '@/feature/brand-presentation/server';
import { renderPptx } from '@/feature/brand-presentation/renderPptx';
import { PresentationError } from '@/feature/brand-presentation/model';
import { ZodError } from 'zod';
export const runtime='nodejs';
export async function POST(request:Request,{params}:{params:Promise<{brandId:string}>}) {
  try {
    if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid request origin.'},{status:403});
    // Bounded streaming read also covers chunked requests without Content-Length.
    const reader=request.body?.getReader();if(!reader)throw new PresentationError('Presentation options are required.');
    const chunks:Uint8Array[]=[];let length=0;
    try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>16000)throw new PresentationError('Presentation options are too large.',413);chunks.push(value);}}finally{await reader.cancel();}
    const input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const {presentation,assets}=await preparePresentationExport((await params).brandId,input);
    const bytes=await renderPptx(presentation,assets);
    const filename=(presentation.brandName.replace(/[^a-zA-Z0-9 -]/g,'').trim().slice(0,70)||'Brand')+' presentation.pptx';
    return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.presentationml.presentation','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'private, no-store'}});
  }catch(error){
    const status=error instanceof PresentationError?error.status:error instanceof ZodError||error instanceof SyntaxError?400:500;
    return Response.json({error:error instanceof PresentationError?error.message:status===400?'Invalid presentation options.':'Presentation could not be generated. Refresh and try again.'},{status});
  }
}
