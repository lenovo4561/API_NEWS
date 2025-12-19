import Layout from "@/components/layout";
import { getNewsCategories, ICategory } from "@/libs/request";
import { getLang } from "@/utils";

import type { GetServerSidePropsContext } from "next/types";

import getConfig from "next/config";
import { Prose } from "@nikolovlazar/chakra-ui-prose";

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

export default function Terms({ categories }: Iprops) {
  return (
    <Layout categories={categories}>
      <Prose>
        <h2>Terms of Service</h2>
        <p>
          Welcome to our news and information platform! By accessing or using
          our services, you agree to comply with and be bound by the following
          Terms of Service. Please read these terms carefully before using our
          platform.
        </p>
        <h4>1. Use of Services</h4>
        <p>
          You agree to use our news and information platform solely for lawful
          purposes and in compliance with all applicable laws and regulations.
          You must not engage in any activity that interferes with or disrupts
          the functioning of the platform or its services.
        </p>
        <h4>2. User Accounts</h4>
        <p>
          To access certain features of our platform, you may need to create a
          user account. You are responsible for maintaining the confidentiality
          of your account credentials and for all activities that occur under
          your account.
        </p>
        <h4>3. Content</h4>
        <p>
          Our platform may include user-generated content, third-party content,
          and proprietary content owned or licensed by us. You agree not to
          reproduce, distribute, modify, or create derivative works of any
          content without prior authorization.
        </p>
        <h4>4. Intellectual Property</h4>
        <p>
          All intellectual property rights in our platform, including
          trademarks, copyrights, and proprietary information, belong to us or
          our licensors. You may not use our intellectual property without our
          express written permission.
        </p>
        <h4>5. Third-Party Links</h4>
        <p>
          Our platform may contain links to third-party websites or services. We
          are not responsible for the content, privacy practices, or actions of
          third parties and recommend reviewing their terms and policies.
        </p>
        <h4>6. Disclaimer of Warranties</h4>
        <p>
          Our platform is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind, either express
          or implied. We do not guarantee the accuracy, completeness, or
          reliability of any information or content on the platform.
        </p>
        <h4>7. Limitation of Liability</h4>
        <p>
          In no event shall we be liable for any direct, indirect, incidental,
          special, or consequential damages arising out of or in connection with
          your use of our platform. This includes damages for loss of profits,
          data, or goodwill.
        </p>
        <h4>8. Indemnification</h4>
        <p>
          You agree to indemnify and hold us harmless from any claims, damages,
          liabilities, or expenses arising out of your use of our platform or
          any violation of these Terms of Service.
        </p>
        <h4>9. Governing Law</h4>
        <p>
          These Terms of Service are governed by the laws of [Jurisdiction],
          without regard to its conflict of laws principles. Any disputes
          arising from these terms shall be subject to the exclusive
          jurisdiction of the courts in [Jurisdiction].
        </p>
        <h4>10. Changes to Terms</h4>
        <p>
          We reserve the right to update or modify these Terms of Service at any
          time. Changes will be effective upon posting on the platform. Your
          continued use of the platform after changes signifies your acceptance
          of the revised terms.
        </p>
        <p>
          If you have any questions or concerns about these Terms of Service,
          please contact us at [support@{SERVER_NAME}].
        </p>
        <p>Last Updated: [2024-04-18]</p>
      </Prose>
    </Layout>
  );
}
