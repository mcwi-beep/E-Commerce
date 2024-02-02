import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
       <div className="descriptionbox-navigator">
         <div className="descriptionbox-nav-box">Description</div>
         <div className="descriptionbox-nav-box fade">Reviews (122)</div>
       </div>
       <div className="descriptionbox-description">
         <p>E-commerce, short for electronic commerce, refers to the buying and selling of goods and services over the internet. It involves online transactions between businesses and consumers, as well as between businesses. E-commerce can take various forms, including online retail stores, electronic marketplaces, and online auction platforms. It has become a prevalent and essential aspect of modern business, allowing for convenient and efficient buying and selling processes without the need for physical storefronts. </p>
         <p>E-commerce is supported by electronic business. The existence value of e-commerce is to allow consumers to shop online and pay online through the Internet, saving the time and space of customers and enterprises, greatly improving transaction efficiency, especially for busy office workers, and also saving a lot of valuable time.</p>
       </div>
    </div>
  )
}

export default DescriptionBox