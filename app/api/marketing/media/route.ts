import { randomUUID } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { mediaWorkspace, publicMediaUrl } from '@/feature/marketing/media/server';
import { MAX_IMAGE_BYTES, normalizeImage } from '@/feature/marketing/media/image';
import { isSameOriginUpload } from '@/feature/marketing/media/request';
export const runtime='nodejs';
export async function GET() {
  try {
    const {session,db}=await mediaWorkspace();
    const {data,error}=await db.from('studio_media_assets').select('*').eq('organization_id',session.organization.id).eq('status','ready').order('created_at',{ascending:false}).limit(200);
    if(error)throw error;
    return Response.json({assets:data.map(row=>({public_id:row.public_id,version:row.version,default_alt:row.default_alt,width:row.width,height:row.height,status:row.status,deliveryUrl:publicMediaUrl(row.delivery_path),thumbnailUrl:publicMediaUrl(row.thumbnail_path)}))},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({error:'Media is unavailable for this workspace.'},{status:403});}
}
export async function POST(request:Request) {
  try {
    if(!isSameOriginUpload(request)) return Response.json({error:'Same-origin upload required.'},{status:403});
    const {session,db}=await mediaWorkspace();
    const length=Number(request.headers.get('content-length'));
    if(!request.body||length>MAX_IMAGE_BYTES)return Response.json({error:'Image exceeds 3 MiB.'},{status:413});
    const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_IMAGE_BYTES){await reader.cancel();return Response.json({error:'Image exceeds 3 MiB.'},{status:413});}chunks.push(value);}
    const bytes=Buffer.concat(chunks),mime=request.headers.get('content-type')??'';
    const normalized=await normalizeImage(bytes,mime);
    const {count,error:countError}=await db.from('studio_media_assets').select('public_id',{count:'exact',head:true}).eq('organization_id',session.organization.id);
    if(countError||(count??0)>=200)throw Error('The media library limit has been reached.');
    // Recheck active identity after decoding, before crossing the privileged storage boundary.
    const current=await mediaWorkspace();if(current.session.membership.id!==session.membership.id)throw Error('Workspace changed.');
    const id=`asset_${randomUUID().replaceAll('-','')}`,base=`${session.organization.id}/${id}/1`,admin=createAdminSupabaseClient();
    for(const [bucket,path,data,type] of [['studio-originals',`${base}/original`,bytes,mime],['studio-delivery',`${base}/email.png`,normalized.delivery,'image/png'],['studio-delivery',`${base}/thumb.png`,normalized.thumbnail,'image/png']] as const){
      const {error}=await admin.storage.from(bucket).upload(path,data,{contentType:type,upsert:false,cacheControl:'31536000'});if(error)throw Error('Image upload did not complete. Please try again.');
    }
    const row={public_id:id,organization_id:session.organization.id,creator_membership_id:session.membership.id,version:1,source_mime:mime,output_mime:'image/png',width:normalized.width,height:normalized.height,byte_size:normalized.delivery.length,source_byte_size:bytes.length,checksum:normalized.checksum,source_checksum:normalized.sourceChecksum,source_path:`${base}/original`,delivery_path:`${base}/email.png`,thumbnail_path:`${base}/thumb.png`,default_alt:'',status:'ready'};
    const {error}=await admin.from('studio_media_assets').insert(row);if(error)throw Error('Media could not be registered.');
    return Response.json({asset:{public_id:id,version:1,default_alt:'',width:row.width,height:row.height,status:'ready',deliveryUrl:publicMediaUrl(row.delivery_path),thumbnailUrl:publicMediaUrl(row.thumbnail_path)}});
  }catch(error){return Response.json({error:error instanceof Error&&/^(Images|Choose|Image|The media|Media)/.test(error.message)?error.message:'Upload is unavailable for this workspace.'},{status:400});}
}
