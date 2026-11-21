/* Bondline: loads the notebook's scripts (Bondline version 39).
   Returning users get them straight away. First-time visitors see the landing page first, so the 3.5 MB of
   app scripts wait until the landing page has loaded and the browser is idle, or until the visitor opens the app.
   Scripts are added with async=false, so they still run in this order. Add new data files to the list below. */
(function(){
  var L=['pro-config.js', 'guide-data.js', 'course-x1.js', 'course-x2.js', 'course-x3.js', 'course-x4.js', 'course-x5.js', 'course-x6.js', 'course-x7.js', 'course-x8.js', 'course-x9.js', 'course-x10.js', 'course-x11.js', 'course-x12.js', 'diagrams.js', 'course-deep-1.js', 'course-deep-2.js', 'course-deep-3.js', 'course-deep-4.js', 'course-deep-5.js', 'course-deep-6.js', 'course-new-1.js', 'course-new-2.js', 'course-new-3.js', 'syllabus-data.js', 'app.js'];
  var root=document.documentElement,started=false;
  function go(){
    if(started)return;started=true;root.classList.add('app-loading');
    L.forEach(function(src){var e=document.createElement('script');e.src=src;e.async=false;
      if(src==='app.js')e.onload=e.onerror=function(){root.classList.remove('app-loading')};
      document.body.appendChild(e)});
  }
  window.BL_LOAD_APP=go;
  if(root.classList.contains('lp-off')){go();return}
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('[data-lp-open]'))go()},true);
  window.addEventListener('load',function(){
    if('requestIdleCallback' in window)requestIdleCallback(go,{timeout:4000});else setTimeout(go,2500);
  });
})();
