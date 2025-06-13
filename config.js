// =================================================================================================
// PAGE CONFIGURATION OBJECT
// This file is the single source of truth for all dynamic content on the case study page.
// The renderer.js script consumes this object to construct the page's HTML.
// Modifying values in this file directly changes the content rendered in the browser.
// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_
const config = {
  // -----------------------------------------------------------------------------------------------
  // GLOBALS
  // Defines values that are reused across multiple sections of the page.
  // Any string value in this config can reference a global by using `{{variableName}}`.
  // Example: `{{companyName}}` will be replaced by "iStreet Realty Group".
  // -----------------------------------------------------------------------------------------------
  globals: {
    // The official company name. Displayed in the header, sidebar, footer, and various text sections.
    companyName: "iStreet Realty Group",

    // The text content for all primary Call-to-Action (CTA) buttons.
    mainCTAButtonText: "Book A Discovery Call",

    // Sets the CSS variable `--gold`. This color is used for the header tag, testimonial borders,
    // link hover effects, and SVG icons in the sidebar/footer.
    primaryColor: "#e3c379",

    // Sets the CSS variable `--accent`. This color is used for the background of all primary buttons.
    accentColor: "#d9c6a2",

    // An array of agent objects. Defines the contact cards shown in the sidebar and footer.
    // The order in this array determines the display order on the page.
    agents: [
      {
        // The agent's full name.
        name: "Rick Roccasalva",
        // (Optional) URL for the agent's circular profile photo. If this property is removed or the
        // URL is invalid, the agent's card will render without a photo, showing only text details.
        imageSrc: "https://images.unsplash.com/photo-1557862921-37829c790f19?fit=crop&w=100&q=80",
        // An array of contact methods. Each object creates a new line with an icon.
        contactDetails: [
          { type: "email", value: "rick@istreelrealty.ca" },
          { type: "phone", value: "(416) 616-9369" }
        ]
      },
      {
        name: "Steven Simonetti",
        imageSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?fit=crop&w=100&q=80",
        contactDetails: [
          { type: "email", value: "steven@istreelrealty.ca" },
          { type: "phone", value: "(416) 400-7653" }
        ]
      }
    ]
  },

  // -----------------------------------------------------------------------------------------------
  // HEADER
  // Defines the content for the main header at the top of the page.
  // -----------------------------------------------------------------------------------------------
  header: {
    // A small, colored label appearing above the main title.
    tag: "CASE STUDY",
    // The main H1 headline for the page.
    title: "How We Helped an Investor Win a 10-Offer Bidding War and Secure a Cash-Flowing Duplex in Vaughan",
    // The subheadline text. It is rendered as HTML, so tags like <strong> and <a> are permitted.
    subheadline: "Purchased in a <strong>High-Demand Area</strong> With Strong Terms—Now <a href=\"#\">Generating Top-Dollar Rent</a> in a Tight Market"
  },

  // -----------------------------------------------------------------------------------------------
  // MAIN BOX
  // Contains content for the two-column layout directly below the header.
  // -----------------------------------------------------------------------------------------------
  mainBox: {
    // Defines the content for the left (main) column.
    summary: {
      title: "How We Helped an Investor Win a 10-Offer Bidding War and Secure a Cash-Flowing Duplex in Vaughan",
      heroImage: { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=800&q=80", alt: "Duplex Vaughan" },
      subTitle: "Summary",
      // An array of strings, where each string becomes a separate paragraph. HTML is allowed.
      paragraphs: [
        "In one of Vaughan’s most competitive pockets, a <strong>savvy investor client was looking for a cash-flowing, turn-key property to build long-term generational wealth</strong>. The challenge: high demand, limited inventory, and bidding wars on nearly every listing worth seeing.",
        "After viewing 8 homes, we found a <strong>rare 2-unit property in Woodbridge</strong> underlisted at $999k to spark competition. The listing drew 10 offers—but through strategic negotiation, a larger deposit, firm terms, and a quick close... we won the deal at $1.26M without needing to be the highest bid. The property has since been <strong>rented at top market value</strong>, exceeding the client’s expectations and <strong>setting the foundation for strong equity gains</strong> in the years to come."
      ]
    },
    // Defines the content for the right (sidebar) column.
    sidebar: {
      image: { src: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?fit=crop&w=200&q=80", alt: "iStreet Realty Group agents" },
      // An array of strings for the sidebar paragraphs. HTML is allowed.
      paragraphs: [
        "At {{companyName}} we are built on integrity, insight, and innovation.<br><br>We combine decades of real estate expertise with cutting-edge technology to deliver unmatched support, transparency, and results for our clients.<br><br>With over 40 years of hands-on real estate experience and extensive corporate backgrounds, our managing partners provide a balanced and strategic approach to Residential, Commercial, and Investment properties.<br><br>We prioritize clear communication and use the latest market insights to guide every client toward success—whether buying, selling, or investing.<br><strong>At iStreet Realty Inc., we're more than real estate experts—we're your trusted partner in building your future.</strong>"
      ]
    }
  },

  // -----------------------------------------------------------------------------------------------
  // SECTIONS
  // An array of section objects that are rendered sequentially down the page.
  // The order of objects in this array dictates the order of sections on the page.
  // -----------------------------------------------------------------------------------------------
  sections: [
    // `type: "standard"`: A flexible content block. All properties within are optional.
    // The renderer will only generate HTML for the properties that are defined.
    {
      type: "standard",
      title: "The Challenge", // Renders as an H3 tag.
      paragraphs: [ // Each string in the array becomes a <p> tag.
        "This investor client had a clear goal: <strong>find a cash-flowing, turn-key duplex in one of Vaughan’s most desirable neighborhoods—Woodbridge.</strong> Out in a market filled with bidding wars and underlisted homes designed to spark competition, finding the right property and <strong>winning it without overpaying was no small feat.</strong>",
        "The biggest challenge? <strong>Every worthwhile home had multiple offers</strong>, and this buyer was competing with aggressive bids from both investors and end-users. There was also <strong>lingering uncertainty around whether a property like this could attract renters at top value</strong>, which could make or break the deal financially."
      ]
    },
    {
      type: "standard",
      title: "The Strategy",
      paragraphs: [
        "With 8 properties viewed and a clear sense of what would work, the client was ready to move fast. <strong>When 95 Mondavi Rd hit the market—underlisted at $999,000 to fuel a bidding war—we saw an opportunity.</strong>",
        "Rick’s negotiation strategy focused on strong offer terms, not just price. By removing financing conditions, offering a larger deposit, and proposing a quicker close, he positioned the client as a serious, low-risk buyer. Rick also maintained clear and professional communication with the listing agent throughout, building trust and credibility."
      ],
      // `testimonial`: If this object exists, a styled blockquote will be rendered.
      testimonial: { quote: "“I had an amazing experience working with Rick & Steven at iStreet Realty Group. Communication and follow-through were prompt every step. Negotiating the winning offer was about strategy, not just price!”<br><span>— Vaughan Investor</span>" }
    },
    {
      type: "standard",
      title: "The Solution",
      paragraphs: [
        "<strong>The winning offer came in at $1,260,000</strong>—not the highest bid on the table, but the most attractive in terms of certainty, speed, and simplicity. The absence of conditions and the strength of the deposit made the difference, and the seller accepted.",
        "<strong>After closing, the client successfully rented out both units</strong> of the property at top market value—proving the property’s income potential. The fast, clean closing allowed the client to move quickly and capitalize on a prime investment opportunity."
      ],
      // `image`: If this object exists, the section is rendered in a two-column layout (text on left, image on right).
      // If this object is removed, the section becomes a single, full-width text column.
      image: { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=800&q=80", alt: "Interior of the secured duplex" }
    },
    {
      type: "standard",
      title: "The Results",
      // `listItems`: If this array exists, an unordered list (<ul>) will be rendered. Each string is a list item (<li>).
      listItems: [
        "The client won a competitive 10-offer bidding war and secured a turn-key duplex in Woodbridge that now generates strong rental income.",
        "Both units were rented out at top market value shortly after closing, confirming the investment’s potential.",
        "<strong>By acting quickly and strategically, the client not only acquired a high-performing property in a competitive market, but also set themselves up for significant equity growth over the next 3–5 years.</strong>"
      ]
    },
    {
      type: "standard",
      title: "Conclusion",
      paragraphs: [ "<strong>In a competitive market, success doesn’t always come down to price.</strong> With the right agent, strategy, and negotiation, even a 10-offer bidding war can be an opportunity—not a roadblock." ]
    },
    // `type: "ctaBanner"`: Renders a distinct, full-width Call-to-Action banner with a dark background.
    {
      type: "ctaBanner",
      ctaBannerContent: {
        subhead: "Trusted By Hundreds Of Home Buyers & Sellers",
        headline: "Find Out More About Working With<br>Rick Roccasalva and Steven<br>Simonetti at {{companyName}}",
        smallText: "Book A Discovery Call Now ➡️"
      }
    }
  ],

  // -----------------------------------------------------------------------------------------------
  // FOOTER
  // Defines the content for the multi-part footer at the bottom of the page.
  // -----------------------------------------------------------------------------------------------
  footer: {
    logo: { src: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?fit=crop&w=200&q=80", alt: "{{companyName}} Logo" },
    brokerageLabel: "Brokerage:",
    brokerageName: "Homelife Partners Realty Corp.",
    brokerageAddress: "123 Main Street, Suite 456, Toronto, ON M1M 1M1",
    // (Optional) A secondary logo, rendered below the primary one.
    secondaryLogo: { src: "https://i.imgur.com/9GIzqTo.png", altTemplate: "Logo of {{brokerageName}}" },
    disclaimerText: "All testimonials on this page are from real clients. Their experiences do not guarantee similar results.<br>Individual results may vary based on location, market conditions, motivation, as well as other unforeseen factors. Your results may vary.",
    privacyPolicy: { text: "Privacy Policy", href: "#" }
  }
};

// Export for Node.js environment (if applicable) or set for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else if (typeof window !== 'undefined') {
  window.config = config;
}