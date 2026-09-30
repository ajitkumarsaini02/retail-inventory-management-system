package com.hcl.retail_inventory.services;

import org.springframework.stereotype.Service;
import com.hcl.retail_inventory.entity.PurchaseOrder;
import com.hcl.retail_inventory.entity.PurchaseOrderStatus;
import com.hcl.retail_inventory.repository.PurchaseOrderRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public Optional<PurchaseOrder> getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id);
    }

    public Optional<PurchaseOrder> getPurchaseOrderByNumber(String purchaseOrderNumber) {

        return purchaseOrderRepository.findByPurchaseOrderNumber(purchaseOrderNumber);
    }

    public List<PurchaseOrder> getPurchaseOrdersBySupplierId(Long supplierId) {

        return purchaseOrderRepository.findBySupplierId(supplierId);
    }

    public List<PurchaseOrder> getPurchaseOrdersByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.findByStatus(status);
    }

    public String checkPurchaseOrderAvailability(Long id) {

        Optional<PurchaseOrder> purchaseOrder = purchaseOrderRepository.findById(id);

        if (purchaseOrder.isPresent()) {
            return "Available";
        }
        else {
            return "Not Available";
        }
    }

    public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder) {

        if (purchaseOrder.getPurchaseOrderItems() != null) {
            for (var item : purchaseOrder.getPurchaseOrderItems()) {
                item.setPurchaseOrder(purchaseOrder);
            }
        }

        return purchaseOrderRepository.save(purchaseOrder);
    }

    public Optional<PurchaseOrder> updatePurchaseOrder(Long id, PurchaseOrder purchaseOrderDetails) {

        Optional<PurchaseOrder> optionalPurchaseOrder = purchaseOrderRepository.findById(id);

        if (optionalPurchaseOrder.isPresent()) {

            PurchaseOrder purchaseOrder = optionalPurchaseOrder.get();
            purchaseOrder.setPurchaseOrderNumber(purchaseOrderDetails.getPurchaseOrderNumber());
            purchaseOrder.setSupplier(purchaseOrderDetails.getSupplier());
            purchaseOrder.setTotalAmount(purchaseOrderDetails.getTotalAmount());
            purchaseOrder.setStatus(purchaseOrderDetails.getStatus());
            purchaseOrder.setExpectedDeliveryDate(purchaseOrderDetails.getExpectedDeliveryDate());
            PurchaseOrder updatedPurchaseOrder = purchaseOrderRepository.save(purchaseOrder);

            return Optional.of(updatedPurchaseOrder);
        }
        return Optional.empty();
    }

    public boolean deletePurchaseOrder(Long id) {

        Optional<PurchaseOrder> optionalPurchaseOrder = purchaseOrderRepository.findById(id);

        if (optionalPurchaseOrder.isPresent()) {
            purchaseOrderRepository.deleteById(id);
            return true;
        }
        return false;
    }
}