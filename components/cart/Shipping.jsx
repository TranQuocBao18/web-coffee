"use client";

import CartContext from "@/context/CartContext";
import axios from "axios";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import BreadCrumbs from "../layouts/BreadCrumbs";

const Shipping = ({ addresses }) => {

  const ShopLocation = '195/4 Đ. 30 Tháng 4, Hưng Lợi, Ninh Kiều, Cần Thơ, Việt Nam';
  
  const { cart } = useContext(CartContext);

  const [shippingInfo, setShippinInfo] = useState("");
  const [DeliveryCharges, setDeliveryCharges] = useState("0");

  useEffect(() => {
    // loadGoogleMapsScript();
  }, []);

  const loadGoogleMapsScript = () => {
    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD2KiCzzhImLLukog_mQe-Cs3_SwnLk3sk&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  };

  const setShippingAddress = (address) => {
    setShippinInfo(address._id);
    console.log("địa chỉ: " + address.street + ", " + address.ward + ", " + address.district + ", " + address.city + ", Việt Nam");
    // calculateDistance(address.street + ", " + address.ward + ", " + address.district + ", " + address.city + ", Việt Nam");

    setDeliveryCharges(50);
  };  

  const calculateDistance = (destination) => {

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [ShopLocation],
        destinations: [destination],
        travelMode: 'DRIVING',
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== 'OK') {
          alert('Đã xảy ra lỗi: ' + status);
          return;
        }
        const distance = response.rows[0].elements[0].distance.text;
        console.log("distance => ", distance);
        if (distance.includes("km")) {
          setDeliveryCharges(calculateShippingFee(Math.floor(parseFloat(distance))));
        } else {
          setDeliveryCharges(calculateShippingFee(Math.floor(parseFloat(distance))/1000));
        }
        
      }
    );
  };

  const calculateShippingFee = (distance) => {
    if (distance <= 5) return 0;
    if (distance <= 10) return 50;
    if (distance <= 20) return 50 + (distance - 10) * 2;
    return 50 + 10 + (distance - 20) * 1;
  }

  const checkoutHandler = async () => {
    if (!shippingInfo) {
      return toast.error("Please select your shipping address");
    }
    try {
      const { data } = await axios.post(
        `${process.env.API_URL}/api/orders/checkout_session`,
        {
          items: cart?.cartItems,
          shippingInfo,
        }
      );

      window.location.href = data.url;
    } catch (error) {
      console.log(error.response);
    }
  };

  const breadCrumbs = [
    { name: "Home", url: "/" },
    { name: "Cart", url: "/cart" },
    { name: "Order", url: "" },
  ];

  return (
    <div>
      <BreadCrumbs breadCrumbs={breadCrumbs} />
      <section className="py-10 bg-gray-50">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-8">
            <main className="md:w-2/3">
              <article className="border border-gray-200 bg-white shadow-sm rounded p-4 lg:p-6 mb-5">
                <h2 className="text-xl font-semibold mb-5">Thông tin vận chuyển</h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {addresses?.map((address) => (
                    <label
                      className="flex p-3 border border-gray-200 rounded-md bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                      onClick={() => setShippingAddress(address)}
                    >
                      <span>
                        <input
                          name="shipping"
                          type="radio"
                          className="h-4 w-4 mt-1"
                        />
                      </span>
                      <p className="ml-2">
                        <span>{address.name}</span>
                        <small className="block text-sm text-gray-400">
                          {address.city}, {address.district}, {address.ward}, {address.street}
                          <br />
                          Số điện thoại: {address.phoneNo}
                        </small>
                      </p>
                    </label>
                  ))}
                </div>

                <Link
                  href="/address/new"
                  className="px-4 py-2 inline-block text-blue-600 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  <i className="mr-1 fa fa-plus"></i> Add new address
                </Link>

                <div className="flex justify-end space-x-2 mt-10">
                  <Link
                    href="/cart"
                    className="px-5 py-2 inline-block text-gray-700 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-gray-100 hover:text-blue-600"
                  >
                    Trở về
                  </Link>
                  <a
                    className="px-5 py-2 inline-block text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 cursor-pointer"
                    onClick={checkoutHandler}
                  >
                    Thanh toán
                  </a>
                </div>
              </article>
            </main>
            <aside className="md:w-1/3">
              <article className="text-gray-600" style={{ maxWidth: "350px" }}>
                <h2 className="text-lg font-semibold mb-3">Summary</h2>
                <ul>
                  <li className="flex justify-between mb-1">
                    <span>Tổng giá tiền:</span>
                    <span>{cart?.checkoutInfo?.amount}.000 VNĐ</span>
                  </li>
                  <li className="flex justify-between mb-1">
                    <span>Giảm giá:</span>
                    <span>{cart?.checkoutInfo?.discount.toFixed(0)}.000 VNĐ</span>
                  </li>
                  <li className="flex justify-between mb-1">
                    <span>Phí vận chuyển:</span>
                    <span>{DeliveryCharges}.000 VNĐ</span>
                  </li>
                  <li className="border-t flex justify-between mt-3 pt-3">
                    <span>Tổng tiền:</span>
                    <span className="text-gray-900 font-bold">
                      {Number(cart?.checkoutInfo?.totalAmount) + Number(DeliveryCharges)}.000 VNĐ
                    </span>
                  </li>
                </ul>

                <hr className="my-4" />

                <h2 className="text-lg font-semibold mb-3">Items in cart</h2>

                {cart?.cartItems?.map((item) => (
                  <figure className="flex items-center mb-4 leading-5">
                    <div>
                      <div className="block relative w-20 h-20 rounded p-1 border border-gray-200">
                        <img
                          width="50"
                          height="50"
                          src={item.image}
                          alt="Title"
                        />
                        <span className="absolute -top-2 -right-2 w-6 h-6 text-sm text-center flex items-center justify-center text-white bg-gray-400 rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                    <figcaption className="ml-3">
                      <p>{item.name.substring(0, 50)}</p>
                      <p className="mt-1 text-gray-400">
                        Tổng tiền: {item.quantity * item.price}.000 VNĐ
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </article>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shipping;
