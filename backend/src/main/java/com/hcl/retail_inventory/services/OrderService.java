package com.hcl.retail_inventory.services;

import org.springframework.stereotype.Service;
import com.hcl.retail_inventory.entity.Order;
import com.hcl.retail_inventory.entity.OrderStatus;
import com.hcl.retail_inventory.repository.OrderRepository;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    public List<Order> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public String checkOrderAvailability(Long id) {
        Optional<Order> order = orderRepository.findById(id);

        if (order.isPresent()) {
            return "Available";
        }
        else {
            return "Not Available";
        }
    }

    public Order createOrder(Order order) {
        if (order.getOrderItems() != null) {
            for (var orderItem : order.getOrderItems()) {
                orderItem.setOrder(order);
            }
        }
        return orderRepository.save(order);
    }

    public Optional<Order> updateOrder(Long id, Order orderDetails) {

        Optional<Order> optionalOrder = orderRepository.findById(id);

        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();

            order.setOrderNumber(orderDetails.getOrderNumber());
            order.setCustomer(orderDetails.getCustomer());
            order.setTotalAmount(orderDetails.getTotalAmount());
            order.setStatus(orderDetails.getStatus());
            order.setShippingAddress(orderDetails.getShippingAddress());
            order.setShippingCity(orderDetails.getShippingCity());
            order.setShippingState(orderDetails.getShippingState());
            order.setShippingPincode(orderDetails.getShippingPincode());

            Order updatedOrder = orderRepository.save(order);
            return Optional.of(updatedOrder);
        }
        return Optional.empty();
    }

    public boolean deleteOrder(Long id) {
        Optional<Order> optionalOrder = orderRepository.findById(id);

        if (optionalOrder.isPresent()) {
            orderRepository.deleteById(id);

            return true;
        }
        return false;
    }
}