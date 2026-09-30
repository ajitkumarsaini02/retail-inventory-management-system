package com.hcl.retail_inventory.controller;

import com.hcl.retail_inventory.entity.Supplier;
import com.hcl.retail_inventory.services.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {

        Optional<Supplier> supplier = supplierService.getSupplierById(id);

        if (supplier.isPresent()) {
            return ResponseEntity.ok(supplier.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<String> checkSupplierAvailability(@PathVariable Long id) {

        String result = supplierService.checkSupplierAvailability(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Supplier> createSupplier(@Valid @RequestBody Supplier supplier) {

        Supplier savedSupplier = supplierService.createSupplier(supplier);
        return ResponseEntity.ok(savedSupplier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @Valid @RequestBody Supplier supplierDetails) {

        Optional<Supplier> updatedSupplier = supplierService.updateSupplier(id, supplierDetails);

        if (updatedSupplier.isPresent()) {
            return ResponseEntity.ok(updatedSupplier.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {

        boolean deleted = supplierService.deleteSupplier(id);

        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}