import React from 'react';
import { Layout, Typography, Card } from 'antd';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const AboutUs: React.FC = () => {
  return (
    <Layout style={{ padding: '24px', background: '#fff' }}>
      <Content>
        <Card>
          <Title level={2}>About Us</Title>
          <Paragraph>
            Welcome to <strong>ReviewPilot</strong>! We are a dedicated team passionate about simplifying the code review process. 
            Our software leverages the power of ChatGPT to automate and enhance the review of pull requests on GitHub, 
            making your development workflow more efficient and effective.
          </Paragraph>
          <Paragraph>
            <strong>Our Mission:</strong> To provide a seamless, intelligent, and efficient code review experience 
            that empowers developers to focus on building great software.
          </Paragraph>
          <Paragraph>
            <strong>What We Do:</strong>
          </Paragraph>
          <ul>
            <li>Automate code reviews using advanced AI technology.</li>
            <li>Integrate smoothly with GitHub for a hassle-free experience.</li>
            <li>Offer insightful feedback to improve code quality and maintain best practices.</li>
          </ul>
          <Paragraph>
            <strong>Why Choose Us:</strong>
          </Paragraph>
          <ul>
            <li>Easy Integration: Quickly integrate with your existing GitHub workflow.</li>
            <li>AI-Powered: Utilize cutting-edge AI to enhance your code reviews.</li>
            <li>Open Source: Benefit from our open-source approach, ensuring transparency and continuous improvement.</li>
          </ul>
          <Paragraph>
            Join us on our journey to revolutionize code reviews with AI! If you have any questions or need support, feel free to contact us at <a href="mailto:support@gaintrack.in">support@gaintrack.in</a>.
          </Paragraph>
        </Card>
      </Content>
    </Layout>
  );
};
