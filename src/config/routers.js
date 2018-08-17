import Home from "../containers/App";
import Videos from "../containers/video/Videos";
import Video from "../containers/video/Video";
import Queue from "../containers/queue/Queues";

export const breadcrumbNameMap = {
  "/video/list": "视频管理",
  "/video/new": "新建视频",
  "/video/edit": "编辑视频",
  "/video": "视频管理",
  "/queue": "队列管理"
};

export const routers = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/video",
    component: Videos
  },
  {
    path: "/video/new",
    component: Video
  },
  {
    path: "/video/edit",
    component: Video
  },
  {
    path: "/queue",
    component: Queue
  }
];
