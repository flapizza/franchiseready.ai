import {createHash} from 'node:crypto';
export async function oneClickUnsubscribe(request:Request,token:string,apply:(digest:string)=>Promise<boolean>) {
 if(!/^[A-Za-z0-9-]{32,128}$/.test(token))return new Response('Unavailable',{status:400});
 const reader=request.body?.getReader();if(!reader)return new Response('Invalid request',{status:400});
 const chunks:Uint8Array[]=[];let size=0;
 for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>1024){await reader.cancel();return new Response('Invalid request',{status:413});}chunks.push(part.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 try {
  const bounded=new Request(request.url,{method:'POST',headers:{'content-type':request.headers.get('content-type')??''},body:bytes});
  const form=await bounded.formData();
  if(form.get('List-Unsubscribe')!=='One-Click'||[...form.keys()].length!==1)return new Response('Invalid request',{status:400});
  const ok=await apply(createHash('sha256').update(token).digest('hex'));
  return new Response(ok?'Unsubscribed':'Unavailable',{status:ok?200:400,headers:{'Cache-Control':'no-store'}});
 }catch{return new Response('Unavailable',{status:400});}
}
