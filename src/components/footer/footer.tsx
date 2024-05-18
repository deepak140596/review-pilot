import { Col, Row } from 'antd'
import './footer.scss'
import { Footer as AntFooter } from 'antd/es/layout/layout';
import AppLogo from '../logo/logo';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
    <AntFooter className='app-footer'>
        <Row>
            <Col span={6}>
                <div className='heading'> 
                    <h4>Company</h4>
                </div>
                <Link to='/about-us'>
                    <div className='items'>
                        About Us
                    </div>
                </Link>
                <Link to='/privacy-policy'>
                    <div className='items'>
                        Privacy Policy
                    </div>
                </Link>
                <Link to='/terms-of-service'>
                    <div className='items'>
                        Terms of Service
                    </div>
                </Link>
                <Link to='/refund'>
                    <div className='items'>
                        Refund Policy
                    </div>
                </Link>
                <Link to='/contact-us'>
                    <div className='items'>
                        Contact Us
                    </div>
                </Link>
                <Link to='/shipping'>
                    <div className='items'>
                        Shipping
                    </div>
                </Link>
            </Col>
  
            <Col span={6}>
              <div className='heading'> 
                <h4>Developer</h4>
              </div>
              <Link to='/docs'>
                    <div className='items'>
                       Docs
                    </div>
                </Link>
            </Col>
  
            <Col span={12}>
              <AppLogo/>
            </Col>

            <Col span={24}>
                <div className='copy-right'>
                    © 2024 ReviewPilot. All Rights Reserved.
                </div>
            </Col>
          </Row>
        </AntFooter>
      )
}