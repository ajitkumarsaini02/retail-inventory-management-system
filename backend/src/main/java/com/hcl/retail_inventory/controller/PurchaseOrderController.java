package com.hcl.retail_inventory.controller;

import com.hcl.retail_inventory.entity.PurchaseOrder;
import com.hcl.retail_inventory.entity.PurchaseOrderStatus;
import com.hcl.retail_inventory.services.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>>
    getAllPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Long id) {

        Optional<PurchaseOrder> purchaseOrder = purchaseOrderService.getPurchaseOrderById(id);

        if (purchaseOrder.isPresent()) {
            return ResponseEntity.ok(purchaseOrder.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/number/{purchaseOrderNumber}")
    public ResponseEntity<PurchaseOrder>
    getPurchaseOrderByNumber(@PathVariable String purchaseOrderNumber) {

        Optional<PurchaseOrder> purchaseOrder = purchaseOrderService.getPurchaseOrderByNumber(purchaseOrderNumber);

        if (purchaseOrder.isPresent()) {
            return ResponseEntity.ok(purchaseOrder.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PurchaseOrder>>
    getPurchaseOrdersBySupplierId(@PathVariable Long supplierId) {

        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersBySupplierId(supplierId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrder>>
    getPurchaseOrdersByStatus(@PathVariable PurchaseOrderStatus status) {

        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersByStatus(status));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<String>
    checkPurchaseOrderAvailability(@PathVariable Long id) {

        String result = purchaseOrderService.checkPurchaseOrderAvailability(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@Valid @RequestBody PurchaseOrder purchaseOrder) {

        PurchaseOrder savedPurchaseOrder = purchaseOrderService.createPurchaseOrder(purchaseOrder);
        return ResponseEntity.ok(savedPurchaseOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(@PathVariable Long id, @Valid @RequestBody PurchaseOrder purchaseOrderDetails) {

        Optional<PurchaseOrder> updatedPurchaseOrder = purchaseOrderService.updatePurchaseOrder(id, purchaseOrderDetails);

        if (updatedPurchaseOrder.isPresent()) {
            return ResponseEntity.ok(updatedPurchaseOrder.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {

        boolean deleted = purchaseOrderService.deletePurchaseOrder(id);
        if(deleted){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}