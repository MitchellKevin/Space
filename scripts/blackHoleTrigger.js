// window.addEventListener("scroll", (event) => {           

//   console.log(document.documentElement.scrollHeight - window.innerHeight);
//     console.log(window.scrollY);
// });

window.addEventListener('wheel', (e) => {
    // console  .log(e.deltaY);
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    //   const tryingToScrollUp = e.deltaY < 0 && scrollTop === 0;
    const tryingToScrollDown = e.deltaY > 0 && scrollTop >= maxScroll;
    let scrollAmount = e.deltaY;
    let scrolledPassedBottom = false;

    //   if (tryingToScrollUp) console.log('Trying to scroll above the top!');
    if (tryingToScrollDown && scrollAmount >= 100) {
        console.log('Trying to scroll below the bottom!');
        scrolledPassedBottom = true;
    }
}, { passive: true });

//  passive: true -> makes sure that prevent default is not called so that the browswee does not have to wasit on a script while scrolling





