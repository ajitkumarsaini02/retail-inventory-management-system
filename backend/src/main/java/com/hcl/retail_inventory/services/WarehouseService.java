package com.hcl.retail_inventory.services;

import org.springframework.stereotype.Service;
import com.hcl.retail_inventory.entity.Warehouse;
import com.hcl.retail_inventory.repository.WarehouseRepository;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository){
        this.warehouseRepository = warehouseRepository;
    }

    public List<Warehouse> getAllWarehouse(){
        return warehouseRepository.findAll();
    }

    public Optional<Warehouse> getWarehouseById(Long id){
        return warehouseRepository.findById(id);
    }

    public String checkWarehouseAvailability(Long id){
        Optional<Warehouse> warehouse = warehouseRepository.findById(id);

        if(warehouse.isPresent()){
            return "Available";
        }
        else{
            return "Not Available";
        }
    }

    public Warehouse createWarehouse(Warehouse warehouse){
        return warehouseRepository.save(warehouse);
    }

    public Optional<Warehouse> updateWarehouse(Long id, Warehouse warehouseDetails){

        Optional<Warehouse> optionalWarehouse = warehouseRepository.findById(id);

        if(optionalWarehouse.isPresent()){

            Warehouse warehouse = optionalWarehouse.get();

            warehouse.setAddress(warehouseDetails.getAddress());
            warehouse.setCapacity(warehouseDetails.getCapacity());
            warehouse.setCity(warehouseDetails.getCity());
            warehouse.setCode(warehouseDetails.getCode());
            warehouse.setContactNumber(warehouseDetails.getContactNumber());
            warehouse.setContactPerson(warehouseDetails.getContactPerson());
            warehouse.setCountry(warehouseDetails.getCountry());
            warehouse.setDescription(warehouseDetails.getDescription());
            warehouse.setEmail(warehouseDetails.getEmail());
            warehouse.setName(warehouseDetails.getName());
            warehouse.setPincode(warehouseDetails.getPincode());
            warehouse.setState(warehouseDetails.getState());
            warehouse.setStatus(warehouseDetails.getStatus());

            Warehouse updatedWarehouse = warehouseRepository.save(warehouse);

            return Optional.of(updatedWarehouse);
        }
        return Optional.empty();
    }

    public boolean deleteWarehouse(Long id){

        Optional<Warehouse> optionalWarehouse = warehouseRepository.findById(id);

        if(optionalWarehouse.isPresent()){
            warehouseRepository.deleteById(id);

            return true;
        }
        return false;
    }

}