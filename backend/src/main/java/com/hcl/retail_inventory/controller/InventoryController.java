package com.hcl.retail_inventory.controller;

import com.hcl.retail_inventory.entity.Inventory;
import com.hcl.retail_inventory.services.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {

        Optional<Inventory> inventory = inventoryService.getInventoryById(id);

        if (inventory.isPresent()) {
            return ResponseEntity.ok(inventory.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Inventory>> getInventoryByProductId(@PathVariable Long productId) {

        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Inventory>> getInventoryByWarehouseId(@PathVariable Long warehouseId) {

        return ResponseEntity.ok(inventoryService.getInventoryByWarehouseId(warehouseId));
    }

    @GetMapping("/product/{productId}/warehouse/{warehouseId}")
    public ResponseEntity<Inventory> getInventoryByProductAndWarehouse(@PathVariable Long productId, @PathVariable Long warehouseId) {

        Optional<Inventory> inventory = inventoryService.getInventoryByProductAndWarehouse(productId, warehouseId);

        if (inventory.isPresent()) {
            return ResponseEntity.ok(inventory.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<String> checkInventoryAvailability(@PathVariable Long id) {

        String result = inventoryService.checkInventoryAvailability(id);

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Inventory> createInventory(@Valid @RequestBody Inventory inventory) {

        Inventory savedInventory = inventoryService.createInventory(inventory);

        return ResponseEntity.ok(savedInventory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @Valid @RequestBody Inventory inventoryDetails) {

        Optional<Inventory> updatedInventory = inventoryService.updateInventory(id, inventoryDetails);

        if (updatedInventory.isPresent()) {
            return ResponseEntity.ok(updatedInventory.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {

        boolean deleted = inventoryService.deleteInventory(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}