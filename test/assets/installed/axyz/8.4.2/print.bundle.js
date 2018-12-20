/*!
 * Copyright (c) 2016-Present Gmelius Ltd. All Rights Reserved.
 * ===================================================================================================================
 * 
 * Email ............ hello@gmelius.com
 * Website .......... https://gmelius.com
 * About ............ https://gmelius.com/about
 * Privacy Policy ... https://gmelius.com/privacy
 * 
 * Gmelius customizes the look and feel of your inbox, protects your privacy and boosts your email productivity.
 * 
 * Gmelius is a company based in Geneva, Switzerland. Founded in 2016
 * 
 * Gmelius is a company based in Geneva, Switzerland. Founded in 2016
 * Gmelius is used daily by hundreds of thousands of users worldwide
 * 
 * == Press about Gmelius
 * TechCrunch ... https://techcrunch.com/2012/04/23/gmelius-promises-to-improve-the-look-and-feel-of-your-gmail-inbox/
 * Lifehacker ... http://lifehacker.com/gmelius-adds-tons-of-scheduling-snoozing-tweaking-an-1782183096
 * PC World ..... http://www.pcworld.com/article/261155/chrome_firefox_extension_gmelius_makes_gmail_more_readable.html
 * CNET ......... http://www.cnet.com/how-to/clean-up-the-look-of-gmail-with-gmelius/
 * 
 * == Chrome Webstore reviews ***** 5-star reputation
 * https://chrome.google.com/webstore/detail/gmelius-for-gmail/dheionainndbbpoacpnopgmnihkcmnkl/reviews
 * 
 * ============================================ NOTA BENE FOR REVIEWERS ==============================================
 * 
 * INBOX SDK (https://inboxsdk.com)
 * 
 * Gmelius releases new features to users on a weekly basis. Users love our fast updates and quick response to bugs.
 * In order to accomplish this we use the popular InboxSDK library (www.inboxsdk.com). It is used by
 * several large organizations:
 * 
 *   Dropbox ... https://chrome.google.com/webstore/detail/dropbox-for-gmail-beta/dpdmhfocilnekecfjgimjdeckachfbec
 *   HubSpot ... https://chrome.google.com/webstore/detail/hubspot-sales/oiiaigjnkhngdbnoookogelabohpglmd
 *   Stripe .... https://chrome.google.com/webstore/detail/stripe-for-gmail/dhnddbohjigcdbcfjdngilgkdcbjjhna
 *   Giphy ..... https://chrome.google.com/webstore/detail/giphy-for-gmail/andgibkjiikabclfdkecpmdkfanpdapf
 *   Clearbit .. https://chrome.google.com/webstore/detail/clearbit-connect-supercha/pmnhcgfcafcnkbengdcanjablaabjplo
 *   Streak .... https://chrome.google.com/webstore/detail/streak-crm-for-gmail/pnnfemgpilpdaojpnkjdgfgbnnjojfik
 * 
 * The use of the library is similar to using other popular JavaScript libraries like jQuery and Underscore.
 * 
 * The library allows us to load our application code from our server providing our users with fast updates
 * and the ability to quickly respond to bugs. In case of questions, please contact hello@gmelius.com. Thanks.
 * 
 * ===================================================================================================================
 */
!function(e){function t(r){if(n[r])return n[r].exports;var a=n[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,t),a.l=!0,a.exports}var n={};t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=120)}({120:function(e,t,n){"use strict";!function(e){if(e.enabled){var t={business:0,graphic:0,smart:0};switch(e.style){case"business":t.business=1;break;case"graphic":t.graphic=1;break;default:t.smart=1}document.addEventListener("DOMContentLoaded",function(e){var n=document.getElementsByTagName("table"),r=document.getElementsByTagName("hr"),a=(document.getElementsByTagName("img"),document.evaluate('//font[@size=-1 and .="1 message"]',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null));(t.smart||t.business||t.graphic)&&(n&&n[0].parentNode.removeChild(n[0]),r&&(r[r.length-1].parentNode.removeChild(r[r.length-1]),r[0].parentNode.removeChild(r[0])),(t.business||t.graphic)&&(n[1].deleteRow(0),n[1].deleteRow(0)),t.graphic&&n[0].deleteRow(0),a&&a.singleNodeValue.parentNode.removeChild(a.singleNodeValue))})}}(JSON.parse(window.localStorage.getItem("gmelius:print")))}});
//# sourceMappingURL=https://localhost:9000/sourcemap/../sourcemap/print.chrome.js.map