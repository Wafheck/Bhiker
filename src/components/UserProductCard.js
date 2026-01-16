import React from 'react';
import { useNavigate } from 'react-router-dom';
import { modelImageMap, placeholderImage } from '../utils/vehicleImages';

function UserProductCard({ product }) {
    const navigate = useNavigate();
    const cardImage = modelImageMap[product.model] || placeholderImage;
    const typeClass = product.type;

    return (
        <div className="listing-card user-card">
            <img
                src={product.imageUrl || cardImage}
                alt={product.name}
                style={{
                    width: "100%",
                    height: 160,
                    border: "1px solid black",
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 8
                }}
            />
            <h3 style={{ fontWeight: "bold", textAlign: "center" }}>{product.name}</h3>
            <div className="model-button">
                <button type="button" className={typeClass}>{product.type}</button>
            </div>
            <p><b>Model:</b> {product.model}</p>
            <p><b>Price:</b> ₹{product.price} / {product.frequency}</p>
            <p><b>Availability:</b> {product.available}</p>
            <p><b>Location:</b> {product.pincode}</p>
            <button
                className="view-button"
                onClick={() => navigate("/product", { state: { productID: product.productID } })}
                style={{ marginTop: 8 }}
            >
                View Details
            </button>
        </div>
    );
}

export default UserProductCard;
