import imagePaths from "../library/images";
import './logo.scss';

const AppLogo = () => {
    return (
        <div className="logo">
          <img src={imagePaths.LOGO} alt="ReviewPilot Logo" />
        </div>
    );
    
}

export default AppLogo;