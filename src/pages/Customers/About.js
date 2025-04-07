import React from 'react';
import Nav from './Nav';
import './about.css';
function About() {
	return (
		<>
			<Nav />
			<div className='first'> 
				<div className='second'>
					<h1>About Us</h1>
					<p className='third'>
						Food is universally loved for its ability to nourish, delight, and
						bring people together. It satisfies hunger, stimulates senses, and
						evokes memories, making it a cherished aspect of cultures worldwide.
					</p>
				</div>
				<div className='forth'>
					<img src="food.jpeg" />
					<p className='fifth'>
						Welcome To VokLagyo, Your Go-To Destination For Delightful Dining
						Experiences In Jhapa, Nepal! At VokLagyo, We Believe That Great Food
						Should Be Accessible To Everyone, And Our Mission Is To Bring The
						Culinary Treasures Of Jhapa Right To Your Doorstep. Our Carefully
						Curated Selection Of Local And International Cuisines Ensures That
						There's Something For Every Palate. Whether You're Craving
						Traditional Nepali Flavors Or Exploring Global Tastes, VokLagyo Is
						Here To Make Your Dining Desires A Reality. With Our Easy-To-Use
						Platform, Seamless Ordering Process, And Efficient Delivery
						Services, We Strive To Redefine The Way You Experience Food
						Delivery. Join Us On A Gastronomic Journey, And Let VokLagyo Be Your
						Trusted Companion For A Delicious, Hassle-Free Dining Adventure In
						The Heart Of Nepal. <br /><br /><br /><br /><br />
					</p>
				</div>
			</div>
		</>
	);
}

export default About;
