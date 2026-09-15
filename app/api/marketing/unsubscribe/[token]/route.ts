import {oneClickUnsubscribe} from '@/feature/marketing/delivery/unsubscribe-http';
import {applyUnsubscribe} from '@/feature/marketing/delivery/unsubscribe-rpc';
export const runtime='nodejs';
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){return oneClickUnsubscribe(request,(await params).token,applyUnsubscribe);}
