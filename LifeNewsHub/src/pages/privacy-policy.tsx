import Layout from "@/components/layout";
import { getNewsCategories, ICategory } from "@/libs/request";
import { getLang } from "@/utils";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import type { GetServerSidePropsContext } from "next/types";

import getConfig from "next/config";

const {
  publicRuntimeConfig: { SERVER_NAME },
} = getConfig();

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const lang = getLang(context.req?.headers["accept-language"]);

  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  context.res.setHeader("Content-Language", lang);
  const [categories] = await Promise.all([getNewsCategories(lang)]);
  return {
    props: {
      categories,
    },
  };
};

interface Iprops {
  categories: ICategory[];
}

export default function PrivacyPolicy({ categories }: Iprops) {
  return (
    <Layout categories={categories}>
      <Prose>
        <h2>Privacy Policy</h2>
        <p>
          Welcome to our news and information platform! We value your privacy
          and are committed to protecting your personal information. Please read
          this Privacy Policy carefully before using our services.
        </p>
        <h4>1. Information We Collect</h4>
        <p>
          When you use our news and information platform, we may collect the
          following types of information:
        </p>
        <ul>
          <li>
            Personal information provided during registration, such as name,
            email address, contact details, etc.
          </li>
          <li>
            Information related to your use of the service, such as browsing
            history, search queries, subscription preferences, etc.
          </li>
          <li>
            Device information, such as IP address, operating system, browser
            type, etc.
          </li>
          <li>
            Information collected through cookies and similar technologies.
          </li>
        </ul>
        <h4>2. Use of Information</h4>
        <p>We collect information for the following purposes:</p>
        <ul>
          <li>
            Providing, maintaining, and improving our news and information
            platform.
          </li>
          <li>
            Recommending relevant content and personalizing your browsing
            experience.
          </li>
          <li>Processing your subscriptions and managing your account.</li>
          <li>
            Analyzing data for statistics and research to improve our services.
          </li>
          <li>
            Complying with legal requirements and protecting our legitimate
            interests.
          </li>
        </ul>
        <h4>3. Sharing of Information</h4>
        <p>
          We do not share your personal information with third parties without
          your consent, except:
        </p>
        <ul>
          <li>
            When necessary to fulfill our services, we may share necessary
            information with partners (e.g., payment processors, content
            providers).
          </li>
          <li>
            When required by law or government requests, we may disclose
            information.
          </li>
        </ul>
        <h4>4. Information Security</h4>
        <p>
          We implement reasonable security measures to protect your personal
          information from unauthorized access, use, modification, or
          disclosure. However, please note that no internet transmission is
          entirely secure, and you assume some risk in transmitting your
          information.
        </p>
        <h4>5. Cookies and Similar Technologies</h4>
        <p>
          We use cookies and similar technologies to provide, analyze, and
          personalize our services. You can manage your cookie preferences
          according to your preferences, but please note that disabling certain
          cookies may affect some functionalities.
        </p>
        <h4>6. Children&#39;s Privacy</h4>
        <p>
          Our services are not directed to children under the age of 18. If you
          are a minor, please use our services under parental guidance.
        </p>
        <h4>7. Access and Management of Privacy Rights</h4>
        <p>
          You can access, correct, or delete your personal information at any
          time. For any privacy-related questions or concerns, please contact us
          (contact details at the bottom).
        </p>
        <h4>8. Updates to Privacy Policy</h4>
        <p>
          We reserve the right to update this Privacy Policy at any time.
          Updated policies will be published on our news and information
          platform, so please stay informed.
        </p>
        <h4>9. Applicable Law</h4>
        <p>
          This Privacy Policy is governed by the General Data Protection
          Regulation (GDPR) and other applicable laws and regulations in the
          European Union and the United States.
        </p>
        <p>
          By continuing to use our news and information platform services, you
          agree to the information collection, use, and sharing practices
          outlined in this Privacy Policy. If you do not agree with this policy,
          please discontinue using our services.
        </p>
        <p>
          For any questions or concerns, please feel free to contact us at
          [support@{SERVER_NAME}].
        </p>
        <p>Last Updated: [2024-04-18]</p>
      </Prose>
    </Layout>
  );
}
