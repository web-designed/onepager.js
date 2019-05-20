import inView from 'in-view'
import SmoothScroll from 'smooth-scroll'
// import './../scss/onepager.scss'

class OnePager {
   constructor(options){

      // variables
      this.settings = OnePager.mergeSettings(options)

      this.setup = {
         contentWrapper : document.querySelector(this.settings.contentWrapper),
         panels : document.querySelectorAll(this.settings.panelsSelector),
         navContainer : document.querySelector(this.settings.navContainer),
         headerContainer : document.querySelector(this.settings.headerContainer),
         navMobileOpenerContainer: document.querySelector(this.settings.navMobileOpenerContainer),
         navMobileOpener : document.querySelector(this.settings.navMobileOpener),
         isMobile : OnePager.isMobile(this.settings.mobileBreakpoint),
      }

      //classes
      OnePager.addNecessaryClasses(this.setup)

      //navigation
      this.renderNavigation()

      // init sonar
      this.navigationSonar()

      // smooth scrolling
      this.scroll = new SmoothScroll();

      // callbacks
      document.addEventListener('scrollStop', () => { 
         if(typeof this.settings.onScrollStop === 'function'){
            this.settings.onScrollStop(event)
         }
      }, false);

      document.addEventListener('scrollStart', () => { 
         if(typeof this.settings.onScrollStart === 'function'){
            this.settings.onScrollStart(event)
         }
      }, false);

      // init scroll to
      this.initScrollTo()

      // mobile navigation sizes
      if(this.setup.isMobile) this.mobileNavigationInit()

      // attach events
      this.attachEvents()

      // activate animations
      this.handleContentAnimation()
   }

   // merge user settings with defaults
   static mergeSettings(options){
      const settings = {

         //selectors
         contentWrapper: '.onepager-wrapper',
         panelsSelector: '.onepager-panel',
         navContainer: '.onepager-navigation-container',
         navMobileOpenerContainer: '.onepager-navigation-mobile-opener-container',
         headerContainer: '.onepager-header',

         // css class for active elements
         activePanel: 'active',
         activeNavItem: 'active',

         //in view
         inViewOffset: {
            top: 150,
            bottom: 150,
         },

         // icons
         navMobileOpenerIcon: 'data:image/svg+xml;utf8,<svg height="32px" id="Layer_1" style="enable-background:new 0 0 32 32;" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z"/></svg>',
         navMobileCloseIcon: 'data:image/svg+xml;utf8,<svg height="512px" id="Layer_1" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M437.5,386.6L306.9,256l130.6-130.6c14.1-14.1,14.1-36.8,0-50.9c-14.1-14.1-36.8-14.1-50.9,0L256,205.1L125.4,74.5  c-14.1-14.1-36.8-14.1-50.9,0c-14.1,14.1-14.1,36.8,0,50.9L205.1,256L74.5,386.6c-14.1,14.1-14.1,36.8,0,50.9  c14.1,14.1,36.8,14.1,50.9,0L256,306.9l130.6,130.6c14.1,14.1,36.8,14.1,50.9,0C451.5,423.4,451.5,400.6,437.5,386.6z"/></svg>',

         // animation
         navItemAnimation: 'fadeInRight',
         animateContent: false,
         scrollSpeed: 600,

         // mobile
         mobileBreakpoint: 786,

         // callbacks
         onScrollStart: undefined,
         onScrollStop: undefined,
         onEnter: undefined,
         
      }

      //merge options if they exist
      if(options){
         Object.keys(options).forEach(option => {
            settings[option] = options[option]
         })
      }

      return settings
   }

   static addNecessaryClasses(setup){
      if(setup.panels.length > 0){
         setup.panels.forEach(panel => {
            if (!panel.classList.contains('onepager-panel')) {
               panel.classList.add('onepager-panel')
            }
         })
      } else {
         console.error(`onepager.js needs at least one panel -> panelsSelector: '.onepager-panel', in the markup, please refer to the options`)
      }

      if(setup.headerContainer){
         setup.headerContainer.classList.add('onepager-header')
      } else {
         console.error(`onepager.js needs a headerContainer: '.onepager-header' in the markup, please refer to the options`)
      }
      
      if(setup.contentWrapper){
         setup.contentWrapper.classList.add('onepager-wrapper')
      } else {
         console.error(`onepager.js needs a contentWrapper: '.onepager-wrapper' in the markup, please refer to the options`)
      }

      if(setup.navContainer){
         setup.navContainer.classList.add('onepager-navigation-container')
      } else {
         console.error(`onepager.js needs a navContainer: '.onepager-navigation-container' in the markup, please refer to the options`)
      }
   }

   attachEvents() {
      window.addEventListener('resize', this.resizeHandler.bind(this))
      window.addEventListener('load', () => {
         OnePager.handleDesktopFlag(this.setup.isMobile)
         this.scrollToTopOfCurrentPanel()
      })
   }

   resizeHandler(){
      this.setup.isMobile = OnePager.isMobile((this.settings.mobileBreakpoint))
      OnePager.handleDesktopFlag(this.setup.isMobile)
      this.scrollToTopOfCurrentPanel()
      this.navMobileClose()
      if(this.setup.isMobile){
         this.mobileNavigationInit()
      } else {
         this.mobileNavigationDestroy()
      }
   }

   renderNavigation(){
      const navigationMarkup = document.createElement('ul')
      navigationMarkup.classList.add('onepager-navigation')
      navigationMarkup.setAttribute('id', 'onepager-navigation')

      //items
      this.setup.panels.forEach( panel => {
         const navigationItem = document.createElement('li')
         const navigationItemLink = document.createElement('a')
         navigationItemLink.classList.add('onepager-navigation-item')
         navigationItemLink.setAttribute('href', `#${panel.getAttribute('id')}`)
         const navigationItemLinkText = panel.getAttribute('data-onepager-title')

         if(navigationItemLinkText){
            navigationItemLink.innerText = navigationItemLinkText
         } else {
            console.warn(`Please define the "data-onepager-title" for #${panel.getAttribute('id')}`)
         }
         navigationItem.appendChild(navigationItemLink)
         navigationMarkup.appendChild(navigationItem)
      })

      // close button
      const navMobileInnerCloseButton = document.createElement('button')
      navMobileInnerCloseButton.classList.add('onepager-navigation-mobile-inner-close')
      navMobileInnerCloseButton.innerHTML = `<img src='${this.settings.navMobileCloseIcon}'>`
      navMobileInnerCloseButton.addEventListener('click', this.navMobileClose())
      navigationMarkup.appendChild(navMobileInnerCloseButton)

      this.setup.navContainer.appendChild(navigationMarkup)
   }

   initScrollTo(){
      const scrollToContainer = document.querySelector(this.settings.navContainer + ' ul')
      if(scrollToContainer){
         scrollToContainer.addEventListener('click', (el) => {
            el.preventDefault();
            const target = el.target.getAttribute('href')
            if(target){
               this.scrollTo(target)
            }

            // close the mobile navigation
            if(this.setup.isMobile){
               this.navMobileClose()
            }
         })
      }
   }

   scrollTo(target){
      history.pushState(null,null,target)
      const scrollTarget = document.querySelector(target)
      this.scroll.animateScroll(scrollTarget, '' , { speed: this.settings.scrollSpeed });
   }

   scrollToTopOfCurrentPanel(){
      if(window.location.hash){
         const scrollTarget = document.querySelector(window.location.hash)
         if (scrollTarget) {
            this.scroll.animateScroll(scrollTarget, '' , { speed: 600 });
         }  
      }
   }

   navigationSonar(){
      inView.offset(this.settings.inViewOffset)
      inView(this.settings.panelsSelector)
      .on('enter', el => {

         // do sth. on enter
         if(typeof this.settings.onEnter === 'function'){
            this.settings.onEnter(el)
         }

         // remove active from the active item
         this.clearNav()

         // add active to current section
         this.markNavItem(el)
      })
      .on('exit', el => {
         this.markNavItem(this.currentPanelInView())
      })
   }

   currentPanelInView(){
      let currentPanel = undefined
      this.setup.panels.forEach(panel => {
         if(inView.is(panel)){
            currentPanel = panel
         }
      })
      return currentPanel
   }

   markNavItem(el){
      const relNavItem = document.querySelector(`a[href = "#${el.getAttribute('id')}"]`)
      if(relNavItem){
         this.clearNav()
         relNavItem.classList.add(this.settings.activeNavItem)
         history.pushState(null,null,`#${el.getAttribute('id')}`);
      }
   }

   clearNav(){
      const navItem = this.setup.navContainer.querySelector(`a.${this.settings.activeNavItem}`)         
      if(navItem) navItem.classList.remove(this.settings.activeNavItem)
   }

   handleContentAnimation(){
      if(this.settings.animateContent){ 
         console.error('TODO! add the animation to elements not only to panels, see factory-in-view')
         // inView('.animated')
         // .on((el)=> {
         //    el.classList.add('go')
         // })
      }
   }

   // mobile nav helpers
   //--------------------------------------------------------

      static isMobile(mobileBreakpoint){
         return Math.max(document.documentElement.clientWidth, window.innerWidth || 0) <= mobileBreakpoint ? true : false
      }

      static handleDesktopFlag(isMobile){
         if (!isMobile) {
            document.querySelector('body').classList.add('onepager-desktop')
         } else {
            document.querySelector('body').classList.remove('onepager-desktop')
         }
      }

      mobileNavigationInit(){

         // render the opener
         this.addNavMobileOpener(this.setup)

         // add the animation to the nav items
         this.navMobileItemsAddAnimation()
      }

      addNavMobileOpener(){
         if(!document.querySelector('.onepager-navigation-mobile-opener')){
            const opener = document.createElement('button')
            opener.classList.add('onepager-navigation-mobile-opener')
            opener.addEventListener('click', this.navMobileHandleOpen.bind(this))
            opener.innerHTML = `<img src='${this.settings.navMobileOpenerIcon}' />`
            this.setup.navMobileOpenerContainer.appendChild(opener)
         }
      }

      navMobileHandleOpen(e){
         e.preventDefault()
         if(this.navMobileIsOpened()){
            this.navMobileClose()
            this.navMobileItemsSlideOut()
         } else {
            this.navMobileOpen()
         }
      }

      navMobileItemsAddAnimation(){
         this.setup.navContainer.querySelectorAll('ul li a').forEach( (item, index) => {
            item.classList.add('animated')
            item.classList.add(this.settings.navItemAnimation)
            item.classList.add(`delay-${index + 2}00`)
         })
      }

      navMobileItemsRemoveAnimation(){
         this.setup.navContainer.querySelectorAll('ul li a').forEach( (item, index) => {
            item.classList.remove('animated')
            item.classList.remove(this.settings.navItemAnimation)
            item.classList.remove(`delay-${index + 2}00`)
         })
      }

      navMobileItemsSlideIn(){
         this.setup.navContainer.querySelectorAll('ul li a').forEach(item => {
            item.classList.add('go')
         })
      }

      navMobileItemsSlideOut(){
         this.setup.navContainer.querySelectorAll('ul li a').forEach(item => {
            item.classList.remove('go')
         })
      }

      navMobileOpen(){
         this.setup.navContainer.classList.add('active')
         this.navMobileItemsSlideIn()
      }

      navMobileClose(){
         this.setup.navContainer.classList.remove('active')
         this.navMobileItemsSlideOut()
      }

      navMobileIsOpened(){
         return this.setup.navContainer.classList.contains('active')
      }
   
      mobileNavigationDestroy(){
         this.navMobileItemsRemoveAnimation()
      }

}

export default OnePager