"use client"
import React, { useState } from 'react'
import ProductCard from '../Cards/ProductCard';
import OfferLogo from '../Logos/OfferLogo';

const OfferProducts = () => {
    const [products] = useState([
        {
            id: 1,
            name: "Wireless Bluetooth Headphone",
            image: "https://picsum.photos/seed/product1/400/400",
            price: 45.99,
            oldPrice: 89.99,
            discount: 49,
            rating: 4.5,
            sold: 120,
    
        },
        {
            id: 2,
            name: "Smart Watch Series 5",
            image: "https://picsum.photos/seed/product2/400/400",
            price: 59.0,
            oldPrice: 120.0,
            discount: 51,
            rating: 4.2,
            sold: 88,
        },
        {
            id: 3,
            name: "Men's Running Sneakers",
            image: "https://picsum.photos/seed/product3/400/400",
            price: 32.5,
            oldPrice: 65.0,
            discount: 50,
            rating: 4.7,
            sold: 210,
        },
        {
            id: 4,
            name: "Portable Bluetooth Speaker",
            image: "https://picsum.photos/seed/product4/400/400",
            price: 22.99,
            oldPrice: 40.0,
            discount: 43,
            rating: 4.1,
            sold: 65,
        },
        {
            id: 5,
            name: "Leather Backpack Bag",
            image: "https://picsum.photos/seed/product5/400/400",
            price: 38.0,
            oldPrice: 75.0,
            discount: 49,
            rating: 4.6,
            sold: 150,
        },
        {
            id: 6,
            name: "Sunglasses UV Protection",
            image: "https://picsum.photos/seed/product6/400/400",
            price: 15.99,
            oldPrice: 30.0,
            discount: 47,
            rating: 4.0,
            sold: 45,
        },
        {
            id: 7,
            name: "Digital Camera 4K",
            image: "https://picsum.photos/seed/product7/400/400",
            price: 199.0,
            oldPrice: 350.0,
            discount: 43,
            rating: 4.8,
            sold: 30,
        },
        {
            id: 8,
            name: "Gaming Mechanical Keyboard",
            image: "https://picsum.photos/seed/product8/400/400",
            price: 49.99,
            oldPrice: 99.99,
            discount: 50,
            rating: 4.4,
            sold: 95,
        },
        {
            id: 9,
            name: "Fitness Tracker Band",
            image: "https://picsum.photos/seed/product9/400/400",
            price: 18.5,
            oldPrice: 35.0,
            discount: 47,
            rating: 4.3,
            sold: 180,
        },
        {
            id: 10,
            name: "Wireless Charging Pad",
            image: "https://picsum.photos/seed/product10/400/400",
            price: 12.99,
            oldPrice: 25.0,
            discount: 48,
            rating: 4.2,
            sold: 70,
        },
    ]);

    return (
        <div className='p-2 border border-gray-200'>
       <h1 className='py-4 flex w-fit'><OfferLogo label="%" /> Offers

       </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {products.map((item, i) => (

                    <ProductCard item={{...item,isOffer:true}} key={i} />

                ))}
            </div>
            <h1 className='w-full flex justify-center my-5'>     <span className="text-[13px] text-[#F7311E] font-semibold cursor-pointer hover:underline">
                See All Offer Products →
            </span></h1>

        </div>
    )
}

export default OfferProducts