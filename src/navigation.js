// A short acknowledgement before an internal route change. The newest request wins.
export function createNavigation({current,commit,pending=()=>{},reducedMotion=()=>false,delay=110,setTimer=setTimeout,clearTimer=clearTimeout}) {
  let timer;
  function cancel() {
    if(timer!==undefined)clearTimer(timer);
    timer=undefined;
    pending(false);
  }
  function request(path) {
    cancel();
    if(path===current())return false;
    if(reducedMotion()){commit(path);return true;}
    pending(true);
    timer=setTimer(()=>{timer=undefined;pending(false);commit(path);},delay);
    return true;
  }
  return {request,cancel};
}
