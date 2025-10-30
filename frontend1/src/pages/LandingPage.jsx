import Navbar from "../components/Navbar.jsx";
import Banner from "../components/Banner.jsx"
import SearchingBar from "../components/SearchingBar.jsx";
import PromotionCarousel from "../components/PromotionCarousel.jsx"; 
function LandingPage(){

    return (
        
        <>
        <Navbar/>
        <Banner/> 
        <SearchingBar className="mt-10"/>
        <PromotionCarousel/>
        </>
    );
}

export default LandingPage;