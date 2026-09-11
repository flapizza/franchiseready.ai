import { assetIdSchema } from '@/feature/marketing/media/model';
import { mediaWorkspace,publicMediaUrl } from '@/feature/marketing/media/server';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 try{const id=assetIdSchema.parse((await params).id),{session,db}=await mediaWorkspace();const {data,error}=await db.from('studio_media_assets').select('delivery_path').eq('public_id',id).eq('organization_id',session.organization.id).in('status',['ready','archived']).single();if(error||!data)throw error;return new Response(null,{status:302,headers:{Location:publicMediaUrl(data.delivery_path),'Cache-Control':'private, no-store'}});}catch{return new Response('Image unavailable',{status:404});}
}
