import Home from "../containers/App";
import Login from "../containers/login/login";
// import Videos from "../containers/video/videos";
// import Video from "../containers/video/video";

export const breadcrumbNameMap = {
  "/video/list": "视频管理",
  "/video/new": "新建视频",
  "/video/edit": "编辑视频"
};

export const routers = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/login",
    component: Login
  }
  // {
  //   path: "/video/list",
  //   component: Videos
  // },
  // {
  //   path: "/video/new",
  //   component: Video
  // },
  // {
  //   path: "/video/edit/:vid",
  //   component: Video
  // }
];
