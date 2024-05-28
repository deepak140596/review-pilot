import React from 'react';
import { Layout, Typography, Card } from 'antd';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const Shipping: React.FC = () => {
  return (
    <Layout style={{ padding: '24px', background: '#fff' }}>
      <Content>
        <Card>
          <Title level={2}>Shipping</Title>
          <Paragraph>
            Shipping is not applicable for our product.
          </Paragraph>
        </Card>
      </Content>
    </Layout>
  );
};
