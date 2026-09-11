export function isSameOriginUpload(request:Request) {
  const origin=request.headers.get('origin');
  const host=request.headers.get('x-forwarded-host')??request.headers.get('host');
  if(!origin||!host)return false;
  try {const url=new URL(origin);return url.host===host && (url.protocol==='https:'||(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)));}catch{return false;}
}
