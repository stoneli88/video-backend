import Home from "../containers/App";
// import Videos from "../containers/video/videos";
import Video from "../containers/video/video";

export const breadcrumbNameMap = {
  "/video/list": "视频管理",
  "/video/new": "新建视频",
  "/video": "编辑视频"
};

export const routers = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/video",
    component: Video
  },
  {
    path: "/video/new",
    component: Video
  },
];
