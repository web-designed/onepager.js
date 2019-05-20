import '../scss/demo.scss'
import '../scss/onepager.scss'
import hljs from 'highlight.js/lib/highlight'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)
hljs.initHighlightingOnLoad()

import OnePager from './onepager'

const onePager = new OnePager({
   onScrollStart: (event) => {
      // console.log(event)
   },
   onScrollStop: (event) => {
      const animation = event.detail.anchor.querySelector('.animated')
      if(animation){
         animation.classList.add('go')
      }
   },
   onEnter: (el) => {
      const animation = el.querySelector('.animated')
      if(animation){
         animation.classList.add('go')
      }
   }
})

// setTimeout(() => {
//    onePager.navMobileOpen()
//    console.log(onePager.navMobileIsOpened())
//    setTimeout(() => {
//       onePager.navMobileClose()
//       console.log(onePager.navMobileIsOpened())
//    }, 1000);
// }, 2000);