import Link from "next/link";
import type { ReactNode } from "react";
import type { LegalContent } from "./types";

/*
 * English legal texts: DRAFTS for a lawyer's review (marked on the page).
 * They follow the Hebrew texts; if the two differ, the Hebrew version applies.
 * Business facts come from `facts`; never type them here.
 */

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="underline underline-offset-4">
    {children}
  </Link>
);

export const legalEn: LegalContent = {
  accessibility: (f) => (
    <>
      <p>
        {f.name} is committed to equal, accessible service for all customers,
        including people with disabilities. This website follows the Equal
        Rights for Persons with Disabilities (Service Accessibility Adjustments)
        Regulations, 2013, and Israeli Standard SI 5568, which is based on the
        WCAG guidelines. We aim for level AA of WCAG 2.1.
      </p>

      <h2>What we did</h2>
      <ul>
        <li>
          The whole site works with a keyboard alone, with a clear indicator of
          where you are.
        </li>
        <li>Every page starts with a “Skip to main content” link.</li>
        <li>
          Every page has an ordered heading structure, defined regions (header,
          navigation, main content, footer), and a declared language and
          direction: Hebrew right to left, English left to right.
        </li>
        <li>
          Images have text alternatives. Purely decorative images are hidden
          from screen readers.
        </li>
        <li>
          Text has a colour contrast of at least 4.5:1, in every colour theme.
        </li>
        <li>
          The site adapts to small screens and to text zoom up to 200%, without
          horizontal scrolling.
        </li>
        <li>
          The background video on the home page is muted, has a visible pause
          button, and does not play by itself when your device asks for reduced
          motion. It contains no information that isn’t also given as text.
        </li>
        <li>
          Every form field has a visible label. Error messages appear next to
          the field and in a summary at the top of the form.
        </li>
        <li>
          Menus and dialogs close with the Esc key and return you to the button
          that opened them.
        </li>
        <li>
          The site uses no third-party “accessibility overlay”. Accessibility is
          built into the site itself.
        </li>
      </ul>

      <h2>How we check</h2>
      <p>
        Every update runs automated accessibility tests (axe) on every type of
        page, in Hebrew and English, on desktop and mobile, as well as keyboard
        tests. A manual screen-reader review will be done before launch.
      </p>

      <h2>Parts that may not be fully accessible</h2>
      <ul>
        <li>
          PDF catalogs from suppliers and manufacturers. If a catalog isn’t
          accessible to you, <A href={f.links.contact}>contact us</A> and we’ll
          give you the information another way.
        </li>
        <li>
          The Google map on the <A href={f.links.visit}>Visit the store</A>{" "}
          page, which is third-party content. The address, opening hours and
          directions links are also given there as text.
        </li>
      </ul>

      <h2>Accessibility at the store</h2>
      <p>
        Accessibility arrangements at the store itself (parking, entrance,
        aisles and service): {f.missing}
      </p>

      <h2>Found a problem?</h2>
      <p>
        If something on the site or at the store is hard to use, we want to hear
        about it and fix it. Please include the page address and a short
        description.
      </p>
      <ul>
        <li>Accessibility coordinator: {f.coordinator}</li>
        <li>Coordinator’s phone or email: {f.coordinatorContact}</li>
        <li>Store phone: {f.storePhone}</li>
        <li>Address: {f.address}</li>
      </ul>
    </>
  ),

  privacy: (f) => (
    <>
      <p>
        This policy explains what personal information the {f.name} website
        collects, why, who it is shared with, how long it is kept and what
        rights you have.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {f.name}, {f.address}. Business registration number:{" "}
        {f.registrationNumber}. For privacy questions, email {f.email} or call{" "}
        {f.storePhone}.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>What you give us in a form</strong> (contact and
          professionals): name, phone, email (optional), profession and business
          name (professionals), your message, and whether you agreed to receive
          updates. You are not legally required to give it, but without a name
          and phone number we can’t get back to you.
        </li>
        <li>
          <strong>Technical information</strong>: IP address and technical
          browser details, processed by our hosting and security provider
          (Cloudflare) to run the site, protect it from attacks and spam, and
          limit repeated form submissions.
        </li>
        <li>
          <strong>Information kept only in your browser</strong>: “My list”,
          your cookie choice and your colour theme. It is not sent to us.
        </li>
        <li>
          <strong>Analytics</strong>: the site currently uses no analytics. If
          we add it, it will run only after you agree, and this policy will be
          updated.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To get back to you and handle your inquiry.</li>
        <li>To arrange a visit, a stock check or an order.</li>
        <li>To send you updates about new products, only if you agreed.</li>
        <li>To secure the site and prevent spam and abuse.</li>
      </ul>
      <p>We don’t use it for anything else, and we never sell it.</p>

      <h2>Who it is shared with</h2>
      <p>
        We use service providers that process information for us, only for the
        purposes above:
      </p>
      <ul>
        <li>
          <strong>Cloudflare</strong>: hosting, spam protection (Turnstile) and
          keeping a copy of inquiries.
        </li>
        <li>
          <strong>Resend</strong>: emailing each inquiry to us.
        </li>
        <li>
          <strong>Google</strong>: the Google map on the “Visit the store” page
          loads only if you allowed external content or asked to show it.
        </li>
      </ul>
      <p>
        These providers’ servers may be outside Israel, so information may be
        transferred abroad, in line with the Privacy Protection (Transfer of
        Data to Databases Abroad) Regulations. We disclose information to
        authorities only when the law requires it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        A copy of each inquiry is kept in the website’s system for up to 12
        months and then deleted automatically. The inquiry also reaches us by
        email and stays in the store’s mailbox for as long as it is needed to
        handle the inquiry and stay in touch with you.
      </p>

      <h2>Security</h2>
      <p>
        The site runs over an encrypted connection (HTTPS), access to
        information is limited to those who need it, and we take reasonable
        measures under the Privacy Protection (Data Security) Regulations, 2017.
        No security is perfect, however.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li>
          To see the information kept about you (section 13 of the Protection of
          Privacy Law, 1981).
        </li>
        <li>
          To ask us to correct or delete information that is incorrect,
          incomplete, unclear or out of date (section 14 of the Law).
        </li>
        <li>To stop receiving updates at any time, by contacting us.</li>
      </ul>
      <p>
        For requests: email {f.email} or call {f.storePhone}.
      </p>

      <h2>Cookies and browser storage</h2>
      <p>
        See our <A href={f.links.cookies}>cookie policy</A>.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we’ll update the date at the top of the page.
        We’ll also announce significant changes on the site.
      </p>
    </>
  ),

  terms: (f) => (
    <>
      <p>
        Welcome to the {f.name} website. Using the site means you accept these
        terms.
      </p>

      <h2>What the site is</h2>
      <p>
        The site is a catalog of the products sold at the store. You can’t buy
        or pay on it. Purchases are made at the store, under the store’s
        policies and the law, including the Consumer Protection Law, 1981.
      </p>

      <h2>Prices, stock and images</h2>
      <ul>
        <li>
          Prices are in shekels and include VAT. They may change; the price that
          applies is the store price on the day of purchase.
        </li>
        <li>
          Stock and availability information is an estimate only. Please check
          availability before you come.
        </li>
        <li>
          Images are for illustration. Colours and details may look different in
          reality and on different screens. Products and images marked “sample”
          are not real products.
        </li>
        <li>
          If a description or price contains a mistake, we are not bound by it,
          and we’ll correct it as soon as we can.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The content of the site (text, design, images and illustrations) belongs
        to {f.name} or to its rights holders. Don’t copy it or use it
        commercially without written permission. Brand names and trademarks
        belong to their owners.
      </p>

      <h2>Links and external content</h2>
      <p>
        The site links to external services (such as Waze, Google Maps and
        WhatsApp) and to manufacturers’ catalogs. We are not responsible for
        their content or their privacy policies.
      </p>

      <h2>Fair use</h2>
      <p>
        Don’t use the site in a way that could harm it or other users, including
        sending spam through the forms or trying to bypass its security.
      </p>

      <h2>Liability</h2>
      <p>
        We try to keep the information on the site accurate and up to date, but
        the site is provided “as is”. To the extent the law allows, we are not
        liable for damage caused by relying on it.
      </p>

      <h2>Privacy</h2>
      <p>
        How we protect your information:{" "}
        <A href={f.links.privacy}>privacy policy</A>.
      </p>

      <h2>Governing law</h2>
      <p>
        Israeli law applies to these terms. The competent courts in Jerusalem
        have exclusive jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        {f.name}, {f.address}. Phone: {f.storePhone}. Email: {f.email}.
      </p>
    </>
  ),

  cookies: (f) => (
    <>
      <p>
        Cookies are small files a website stores in your browser. The browser’s
        “local storage” is used for similar purposes. This page explains what
        the site stores and why. The site uses no advertising or tracking
        cookies.
      </p>

      <h2>What the site stores in your browser</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-start">
          <thead>
            <tr>
              <th scope="col">What</th>
              <th scope="col">Why</th>
              <th scope="col">How long</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Your cookie choice</td>
              <td>To remember it and not ask again</td>
              <td>Until you change or delete it</td>
            </tr>
            <tr>
              <td>“My list” (SKUs and quantities only)</td>
              <td>To keep the products you picked</td>
              <td>Until you delete it</td>
            </tr>
            <tr>
              <td>Colour theme (during the demo)</td>
              <td>To show the theme you picked</td>
              <td>Until you change it</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        This stays in your browser only, is not sent to us and is needed for the
        site to work, so it doesn’t require consent.
      </p>

      <h2>External services</h2>
      <ul>
        <li>
          <strong>Google map</strong>: loads only if you allowed “external
          content” or clicked “Show the map”. Google may set its own cookies.
        </li>
        <li>
          <strong>Spam protection (Cloudflare Turnstile)</strong>: loads only
          when you start filling in a form, and may store essential technical
          information to detect automated activity.
        </li>
        <li>
          <strong>Analytics</strong>: none at the moment. If we add it, it will
          run only with your consent.
        </li>
      </ul>

      <h2>Changing your choice</h2>
      <p>
        You can change your choice at any time:{" "}
        {f.cookieSettings("open cookie settings")}, or use the “Cookie settings”
        link at the bottom of every page. You can also delete cookies and site
        data in your browser settings.
      </p>
      <p>
        More about your information:{" "}
        <A href={f.links.privacy}>privacy policy</A>.
      </p>
    </>
  ),
};
