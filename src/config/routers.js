import Home from "../containers/App";
// import Videos from "../containers/video/videos";
import Video from "../containers/video/video";

export const breadcrumbNameMap = {
  "/video/list": "视频管理",
  "/video/new": "新建视频",
  "/video/edit": "编辑视频",
  "/video": "视频"
};

export const routers = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/video",
    component: Home
  },
  {
    path: "/video/new",
    component: Video
  },
  {
    path: "/video/edit",
    component: Video
  },
];
