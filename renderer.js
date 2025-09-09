document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.config === 'undefined') {
    console.error('Configuration object (window.config) not found. Make sure config.js is loaded before renderer.js.');
    return;
  }

  const { globals, header, mainBox, sections, footer } = window.config;

  // Function to apply custom colors from config to CSS variables
  function applyCustomColors() {
    if (globals && globals.primaryColor) {
      document.documentElement.style.setProperty('--gold', globals.primaryColor);
    }
    if (globals && globals.accentColor) {
      document.documentElement.style.setProperty('--accent', globals.accentColor);
    }
  }
  applyCustomColors(); // Apply colors as soon as config is available

  // Helper function to get a value from globals, supporting dot notation for nested properties
  function getGlobal(path) {
    if (!path) return '';
    // This simplified version assumes path is a direct key in globals.
    // The more complex reduce logic can be added back if needed for deep nesting like 'globals.agents.0.name'
    return globals[path] || '';
  }

  // Helper function to process template strings like "{{companyName}}"
  function processTemplateString(templateStr, dataObject = globals) {
    if (typeof templateStr !== 'string') return templateStr;
    return templateStr.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      let value;
      // Simplified lookup
      if (dataObject && dataObject.hasOwnProperty(key)) {
        value = dataObject[key];
      } else if (globals && globals.hasOwnProperty(key)) {
        value = globals[key];
      } else if (footer && footer.hasOwnProperty(key)) {
        value = footer[key];
      }
      return value !== undefined ? value : match;
    });
  }

  // --- Renderer Functions ---

  function renderHeader(headerData) {
    const headerElement = document.getElementById('dynamic-header');
    if (!headerElement) {
      console.error('Element with ID "dynamic-header" not found.');
      return;
    }
    let subheadlineHTML = processTemplateString(headerData.subheadline || '');
    const ctaButtonURL = getGlobal('mainCTAButtonURL') || '#';

    headerElement.innerHTML = `
      <div class="header-content-wrapper">
        <div class="case-study-tag">${processTemplateString(headerData.tag || '')}</div>
        <h1>${processTemplateString(headerData.title || '')}</h1>
        <div class="subheadline">${subheadlineHTML}</div>
        <a href="${ctaButtonURL}" class="discovery-btn-link"><button class="discovery-btn">${getGlobal('mainCTAButtonText') || 'Book A Discovery Call'}</button></a>
      </div>
    `;
  }

  function renderMainBox(mainBoxData) {
    const summaryContainer = document.getElementById('dynamic-main-content');
    const sidebarContainer = document.getElementById('dynamic-sidebar');
    const ctaButtonURL = getGlobal('mainCTAButtonURL') || '#';

    if (summaryContainer && mainBoxData.summary) {
      const summary = mainBoxData.summary;
      summaryContainer.innerHTML = `
        <h2>${processTemplateString(summary.title || '')}</h2>
        ${summary.heroImage ? `<img class="hero" src="${summary.heroImage.src}" alt="">` : ''}
        ${summary.subTitle ? `<h2>${processTemplateString(summary.subTitle)}</h2>` : ''}
        ${(summary.paragraphs || []).map(p => `<p>${processTemplateString(p)}</p>`).join('')}
        <a href="${ctaButtonURL}" class="summary-btn-link"><button class="summary-btn">${getGlobal('mainCTAButtonText') || 'Book A Discovery Call'}</button></a>
      `;
    } else if (!summaryContainer) {
        console.error('Element with ID "dynamic-main-content" not found.');
    }


    if (sidebarContainer && mainBoxData.sidebar) {
      const sidebar = mainBoxData.sidebar;
      let contactsHTML = '';
      if (globals.agents && Array.isArray(globals.agents)) {
        globals.agents.forEach((agent, agentIndex) => {
          if (agent && agent.name && agent.contactDetails && Array.isArray(agent.contactDetails)) {
            let agentBlockHTML = '';
            if (agent.imageSrc) {
              agentBlockHTML += `<img src="${agent.imageSrc}" alt="" class="sidebar-agent-photo">`;
            }
            
            let agentDetailsHTML = `<div class="sidebar-agent-info">`;
            agentDetailsHTML += `<h4 class="sidebar-agent-name">${processTemplateString(agent.name)}</h4>`;
            
            agent.contactDetails.forEach(detail => {
              let iconSvg = '';
              if (detail.type === "email") {
                iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4C2.897 4 2 4.897 2 6v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V8.414l8 4.999 8-4.999V18H4zm8-7.414l-8-4.999V6h16v-.413l-8 4.999z"></path></svg>`;
              } else if (detail.type === "phone") {
                iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.314 0-10 1.668-10 5v3h20v-3c0-3.332-6.686-5-10-5z"></path></svg>`;
              }
              agentDetailsHTML += `<div class="contact-item">${iconSvg}${processTemplateString(detail.value)}</div>`;
            });
            agentDetailsHTML += `</div>`;

            if (agent.imageSrc) {
              contactsHTML += `<div class="sidebar-agent-block has-image">${agentBlockHTML}${agentDetailsHTML}</div>`;
            } else {
              contactsHTML += `<div class="sidebar-agent-block">${agentDetailsHTML}</div>`;
            }

            if (globals.agents.length > 1 && agentIndex < globals.agents.length - 1) {
              contactsHTML += `<hr class="sidebar-agent-divider">`;
            }
          }
        });
      }

      sidebarContainer.innerHTML = `
        <h3>${processTemplateString(sidebar.title) || 'About Us'}</h3>
        ${sidebar.image ? `<img src="${sidebar.image.src}" alt="">` : ''}
        ${(sidebar.paragraphs || []).map(p => `<p>${processTemplateString(p)}</p>`).join('')}
        <div class="contacts">${contactsHTML}</div>
      `;
    } else if (!sidebarContainer) {
        console.error('Element with ID "dynamic-sidebar" not found.');
    }
  }

  function renderSections(sectionsArray) {
    const sectionsContainer = document.getElementById('dynamic-sections-container');
    if (!sectionsContainer) {
      console.error('Element with ID "dynamic-sections-container" not found.');
      return;
    }
    const ctaButtonURL = getGlobal('mainCTAButtonURL') || '#';

    sectionsArray.forEach(sectionData => {
      let sectionHTML = '';
      let outerDivClass = 'section';

      if (sectionData.type === 'ctaBanner' && sectionData.ctaBannerContent) {
        const bannerContent = sectionData.ctaBannerContent;
        outerDivClass = 'cta-banner';
        sectionHTML = `
          <div class="${outerDivClass}">
            <div class="cta-banner-content">
              <div>
                <div class="cta-banner-subhead">${processTemplateString(bannerContent.subhead || '')}</div>
                <div class="cta-banner-headline">${processTemplateString(bannerContent.headline || '')}</div>
                <div class="cta-banner-small">${processTemplateString(bannerContent.smallText || '')}</div>
              </div>
              <a href="${ctaButtonURL}" class="cta-banner-btn-link"><button class="cta-banner-btn">${getGlobal('mainCTAButtonText') || 'Book A Discovery Call'}</button></a>
            </div>
          </div>
        `;
      } else if (sectionData.type === 'standard') {
        const imageHtml = sectionData.image ? `<div class="section-image-content"><img src="${sectionData.image.src}" alt=""></div>` : '';
        
        const textContentHtml = `
          <div class="section-text-content">
            ${sectionData.title ? `<h3>${processTemplateString(sectionData.title)}</h3>` : ''}
            ${(sectionData.paragraphs || []).map(p => `<p>${processTemplateString(p)}</p>`).join('')}
            ${sectionData.listItems ? `<ul>${sectionData.listItems.map(li => `<li>${processTemplateString(li)}</li>`).join('')}</ul>` : ''}
            ${sectionData.testimonial ? `<div class="testimonial">${processTemplateString(sectionData.testimonial.quote)}</div>` : ''}
          </div>
        `;

        let contentHTML = sectionData.image ? `${textContentHtml}${imageHtml}` : textContentHtml;
        const innerSectionClass = sectionData.image ? 'section-inner section-with-image' : 'section-inner';
        sectionHTML = `<div class="${outerDivClass}"><div class="${innerSectionClass}">${contentHTML}</div></div>`;
      }
      sectionsContainer.innerHTML += sectionHTML;
    });
  }

  function renderFooter(footerData) {
    const footerElement = document.getElementById('dynamic-footer');
    if (!footerElement) {
      console.error('Element with ID "dynamic-footer" not found.');
      return;
    }
    const currentYear = new Date().getFullYear();
    const companyNameForCopyright = getGlobal('companyName');
    const copyrightText = `&copy; ${currentYear} ${companyNameForCopyright || 'Your Company'}. All rights reserved.`;

    const disclaimerHtml = footerData.disclaimerText ? `<div class="footer-top-disclaimer">${processTemplateString(footerData.disclaimerText, footerData)}</div>` : '';
    
    let brokerageInfoHtml = '';
    if (footerData.brokerageLabel && footerData.brokerageName) {
      brokerageInfoHtml += `<strong>${processTemplateString(footerData.brokerageLabel, footerData)}</strong> ${processTemplateString(footerData.brokerageName, footerData)}`;
    }
    if (footerData.brokerageAddress) {
      brokerageInfoHtml += `<br>${processTemplateString(footerData.brokerageAddress, footerData)}`;
    }

    const mainLogoHtml = footerData.logo ? `<img class="footer-logo-main" src="${footerData.logo.src}" alt="">` : '';

    const conditionalSecondaryLogoHtml = (footerData.secondaryLogo && footerData.secondaryLogo.src)
      ? `<img class="footer-logo-secondary" src="${footerData.secondaryLogo.src}" alt="">`
      : '';

    const privacyPolicyHtml = footerData.privacyPolicy
      ? `<a href="${footerData.privacyPolicy.href || '#'}">${processTemplateString(footerData.privacyPolicy.text || 'Privacy Policy', footerData)}</a>`
      : '';

    let agentContactsFooterHtml = '';
    if (globals.agents && Array.isArray(globals.agents)) {
      globals.agents.forEach(agent => {
        if (agent && agent.name && agent.contactDetails && Array.isArray(agent.contactDetails)) {
          agentContactsFooterHtml += `<div class="footer-agent-contact-item">`;
          agentContactsFooterHtml += `<h5 class="footer-agent-name">${processTemplateString(agent.name)}</h5>`;
          agent.contactDetails.forEach(detail => {
            let iconSvg = '';
            if (detail.type === "email") {
              iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4C2.897 4 2 4.897 2 6v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V8.414l8 4.999 8-4.999V18H4zm8-7.414l-8-4.999V6h16v-.413l-8 4.999z"></path></svg>`;
            } else if (detail.type === "phone") {
              iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.314 0-10 1.668-10 5v3h20v-3c0-3.332-6.686-5-10-5z"></path></svg>`;
            }
            agentContactsFooterHtml += `<div class="footer-agent-detail">${iconSvg} ${processTemplateString(detail.value)}</div>`;
          });
          agentContactsFooterHtml += `</div>`;
        }
      });
    }

    footerElement.innerHTML = `
      ${disclaimerHtml}
      <div class="footer-content-grid">
        <div class="footer-column-logos">
          ${mainLogoHtml}
          ${conditionalSecondaryLogoHtml ? `<div class="footer-logo-secondary-wrapper">${conditionalSecondaryLogoHtml}</div>` : ''}
        </div>
        <div class="footer-column-info">
          <div class="footer-brokerage-info">
            ${brokerageInfoHtml}
          </div>
        </div>
        <div class="footer-column-agents">
          ${agentContactsFooterHtml}
        </div>
      </div>
      <div class="footer-bottom-bar">
        <span class="copyright-text">${copyrightText}</span>
        <span class="privacy-policy-link">${privacyPolicyHtml}</span>
      </div>
    `;
  }

  // Function to inject Facebook Pixel code
  function injectFacebookPixel() {
    if (globals && globals.facebookPixelId && globals.facebookPixelId.trim() !== '') {
      const pixelId = globals.facebookPixelId.trim();
      
      // Create and inject the Facebook Pixel base code
      const pixelCode = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      
      // Create script element
      const script = document.createElement('script');
      script.innerHTML = pixelCode;
      document.head.appendChild(script);
      
      // Add noscript fallback
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript);
      
      console.log('Facebook Pixel initialized with ID:', pixelId);
      
      // Add event tracking for CTA button clicks
      document.addEventListener('click', function(event) {
        if (event.target.matches('.discovery-btn, .summary-btn, .cta-banner-btn')) {
          fbq('track', 'Lead');
        }
      });
    }
  }

  // --- Initialize Page ---
  injectFacebookPixel(); // Inject Facebook Pixel first
  if (header) renderHeader(header);
  if (mainBox) renderMainBox(mainBox);
  if (sections) renderSections(sections);
  if (footer) renderFooter(footer);

});