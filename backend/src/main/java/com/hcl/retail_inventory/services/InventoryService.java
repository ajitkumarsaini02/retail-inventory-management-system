package com.hcl.retail_inventory.services;

import org.springframework.stereotype.Service;
import com.hcl.retail_inventory.entity.Inventory;
import com.hcl.retail_inventory.repository.InventoryRepository;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Optional<Inventory> getInventoryById(Long id) {
        return inventoryRepository.findById(id);
    }

    public List<Inventory> getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public List<Inventory> getInventoryByWarehouseId(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId);
    }

    public Optional<Inventory> getInventoryByProductAndWarehouse(Long productId, Long warehouseId) {

        return inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId);
    }

    public String checkInventoryAvailability(Long id) {

        Optional<Inventory> inventory = inventoryRepository.findById(id);

        if (inventory.isPresent()) {
            Inventory stock = inventory.get();

            if (stock.getQuantity() > stock.getReservedQuantity()) {
                return "Available";
            }
            else {
                return "Out of Stock";
            }
        }

        return "Not Available";
    }

    public Inventory createInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    public Optional<Inventory> updateInventory(Long id, Inventory inventoryDetails) {

        Optional<Inventory> optionalInventory = inventoryRepository.findById(id);

        if (optionalInventory.isPresent()) {
            Inventory inventory = optionalInventory.get();

            inventory.setProduct(inventoryDetails.getProduct());
            inventory.setWarehouse(inventoryDetails.getWarehouse());
            inventory.setQuantity(inventoryDetails.getQuantity());
            inventory.setReservedQuantity(inventoryDetails.getReservedQuantity());
            inventory.setReorderLevel(inventoryDetails.getReorderLevel());

            Inventory updatedInventory = inventoryRepository.save(inventory);

            return Optional.of(updatedInventory);
        }
        return Optional.empty();
    }

    public boolean deleteInventory(Long id) {

        Optional<Inventory> optionalInventory = inventoryRepository.findById(id);

        if (optionalInventory.isPresent()) {
            inventoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}