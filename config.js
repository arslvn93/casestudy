// =================================================================================================
// PAGE CONFIGURATION OBJECT
// This file defines all the dynamic content for the case study page.
// The `renderer.js` file reads this object to build the HTML.
// To change text, images, or other content, edit the values in this file.
// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_
const config = {
  // -----------------------------------------------------------------------------------------------
  // GLOBALS
  // These are values that can be reused throughout the page.
  // Use the `{{variableName}}` syntax in any string to automatically insert a value from here.
  // For example, `{{companyName}}` will be replaced with "iStreet Realty Group".
  // -----------------------------------------------------------------------------------------------
  globals: {
    // The main name of the company or brand. Used in the header, footer, and other text.
    companyName: "iStreet Realty Group",

    // The default text for all major Call-to-Action (CTA) buttons.
    mainCTAButtonText: "Book A Discovery Call",
    // The destination URL for all major Call-to-Action (CTA) buttons.
    mainCTAButtonURL: "https://calendly.com/your-salesgenius-link",

    // The primary theme color for the page (e.g., for tags, links, highlights).
    // This value is applied to the `--gold` CSS variable.
    primaryColor: "#e3c379",

    // The accent theme color, typically used for button backgrounds.
    // This value is applied to the `--accent` CSS variable.
    accentColor: "#d9c6a2",

    // Facebook Pixel ID for tracking. Leave empty to disable Facebook tracking.
    facebookPixelId: "1074316633770404",

    // A list of agent objects. This data is used to build the contact cards in the sidebar and footer.
    // You can add or remove agents from this list.
    agents: [
      {
        // Full name of the agent.
        name: "Rick Roccasalva",
        // (Optional) URL for the agent's photo. If omitted, no photo will be shown for this agent.
        imageSrc: "https://images.unsplash.com/photo-1557862921-37829c790f19?fit=crop&w=100&q=80",
        // A list of contact methods for the agent.
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
  // Content for the main header section at the top of the page.
  // -----------------------------------------------------------------------------------------------
  header: {
    // A small tag or label that appears above the main title.
    tag: "CASE STUDY",
    // The main headline (H1) of the page.
    title: "How We Helped an Investor Win a 10-Offer Bidding War and Secure a Cash-Flowing Duplex in Vaughan",
    // The subheadline below the main title. Can include HTML tags like <strong> or <a>.
    subheadline: "Purchased in a <strong>High-Demand Area</strong> With Strong Terms—Now Generating Top-Dollar Rent in a Tight Market"
  },

  // -----------------------------------------------------------------------------------------------
  // MAIN BOX
  // This object contains the content for the two-column layout below the header,
  // which includes the main summary and the sidebar.
  // -----------------------------------------------------------------------------------------------
  mainBox: {
    // Content for the left column (the main summary).
    summary: {
      title: "How We Helped an Investor Win a 10-Offer Bidding War and Secure a Cash-Flowing Duplex in Vaughan",
      heroImage: { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=800&q=80" },
      subTitle: "Summary",
      // An array of paragraph strings. Each string is a new paragraph. Can include HTML.
      paragraphs: [
        "In one of Vaughan’s most competitive pockets, a <strong>savvy investor client was looking for a cash-flowing, turn-key property to build long-term generational wealth</strong>. The challenge: high demand, limited inventory, and bidding wars on nearly every listing worth seeing.",
        "After viewing 8 homes, we found a <strong>rare 2-unit property in Woodbridge</strong> underlisted at $999k to spark competition. The listing drew 10 offers—but through strategic negotiation, a larger deposit, firm terms, and a quick close... we won the deal at $1.26M without needing to be the highest bid. The property has since been <strong>rented at top market value</strong>, exceeding the client’s expectations and <strong>setting the foundation for strong equity gains</strong> in the years to come."
      ]
    },
    // Content for the right column (the sidebar).
    sidebar: {
      title: "About {{companyName}}",
      image: { src: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?fit=crop&w=200&q=80" },
      // An array of paragraph strings for the sidebar. Can include HTML like <br> for line breaks.
      paragraphs: [
        "At {{companyName}} we are built on integrity, insight, and innovation.",
        "We combine decades of real estate expertise with cutting-edge technology to deliver unmatched support, transparency, and results for our clients.",
        "With over 40 years of hands-on real estate experience and extensive corporate backgrounds, our managing partners provide a balanced and strategic approach to Residential, Commercial, and Investment properties.",
        "We prioritize clear communication and use the latest market insights to guide every client toward success—whether buying, selling, or investing.",
        "<strong>At iStreet Realty Inc., we're more than real estate experts—we're your trusted partner in building your future.</strong>"
      ]
    }
  },

  // -----------------------------------------------------------------------------------------------
  // SECTIONS
  // An array of content sections that appear in order below the main box.
  // You can add, remove, or reorder these section objects.
  // -----------------------------------------------------------------------------------------------
  sections: [
    // `type: "standard"`: A flexible section that can contain a title, paragraphs, a list,
    // a testimonial, and an image. All properties are optional.
    // If an `image` is included, the section will render as two columns (text and image).
    // If no `image` is included, it will be a single, full-width column.
    {
      type: "standard",
      title: "The Challenge",
      paragraphs: [
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
      // An optional testimonial object. Renders as a styled blockquote.
      testimonial: { quote: "“I had an amazing experience working with Rick & Steven at iStreet Realty Group. Communication and follow-through were prompt every step. Negotiating the winning offer was about strategy, not just price!”<br><span>— Vaughan Investor</span>" }
    },
    {
      type: "standard",
      title: "The Solution",
      paragraphs: [
        "<strong>The winning offer came in at $1,260,000</strong>—not the highest bid on the table, but the most attractive in terms of certainty, speed, and simplicity. The absence of conditions and the strength of the deposit made the difference, and the seller accepted.",
        "<strong>After closing, the client successfully rented out both units</strong> of the property at top market value—proving the property’s income potential. The fast, clean closing allowed the client to move quickly and capitalize on a prime investment opportunity."
      ],
      // An optional image object. If present, creates a two-column layout for this section.
      image: { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=800&q=80" }
    },
    {
      type: "standard",
      title: "The Results",
      // An optional array of strings for a bulleted list.
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
  // Content for the footer at the bottom of the page.
  // -----------------------------------------------------------------------------------------------
  footer: {
    logo: { src: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?fit=crop&w=200&q=80" },
    brokerageLabel: "Brokerage:",
    brokerageName: "Homelife Partners Realty Corp.",
    brokerageAddress: "123 Main Street, Suite 456, Toronto, ON M1M 1M1",
    // A secondary logo, often for the brokerage. Optional.
    secondaryLogo: { src: "https://i.imgur.com/9GIzqTo.png" },
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