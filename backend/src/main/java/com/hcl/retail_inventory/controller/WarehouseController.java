package com.hcl.retail_inventory.controller;

import com.hcl.retail_inventory.entity.Warehouse;
import com.hcl.retail_inventory.services.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouse());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<String> checkWarehouseAvailability(@PathVariable Long id) {

        String result = warehouseService.checkWarehouseAvailability(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long id) {

        Optional<Warehouse> warehouse = warehouseService.getWarehouseById(id);
        if (warehouse.isPresent()) {
            return ResponseEntity.ok(warehouse.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@Valid @RequestBody Warehouse warehouse) {

        Warehouse savedWarehouse = warehouseService.createWarehouse(warehouse);
        return ResponseEntity.ok(savedWarehouse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable Long id, @Valid @RequestBody Warehouse warehouseDetails) {

        Optional<Warehouse> updatedWarehouse = warehouseService.updateWarehouse(id, warehouseDetails);

        if (updatedWarehouse.isPresent()) {
            return ResponseEntity.ok(updatedWarehouse.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {

        boolean deleted = warehouseService.deleteWarehouse(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}