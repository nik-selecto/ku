import { DeleteReq } from './delete/delete.api';
import { GetReq } from './get/get.api';
import { PostReq } from './post/post.api';

export class KuRequest {
    public static POST = PostReq;

    public static GET = GetReq;

    public static DELETE = DeleteReq;
}
