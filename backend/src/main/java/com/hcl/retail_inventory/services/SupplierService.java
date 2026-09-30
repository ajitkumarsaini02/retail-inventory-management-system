package com.hcl.retail_inventory.services;

import org.springframework.stereotype.Service;
import com.hcl.retail_inventory.entity.Supplier;
import com.hcl.retail_inventory.repository.SupplierRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> getSupplierById(Long id) {
        return supplierRepository.findById(id);
    }

    public String checkSupplierAvailability(Long id) {

        Optional<Supplier> supplier = supplierRepository.findById(id);

        if (supplier.isPresent()) {
            return "Available";
        }
        else {
            return "Not Available";
        }
    }

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Optional<Supplier> updateSupplier(Long id, Supplier supplierDetails) {

        Optional<Supplier> optionalSupplier = supplierRepository.findById(id);

        if (optionalSupplier.isPresent()) {
            Supplier supplier = optionalSupplier.get();

            supplier.setName(supplierDetails.getName());
            supplier.setEmail(supplierDetails.getEmail());
            supplier.setPhone(supplierDetails.getPhone());
            supplier.setAddress(supplierDetails.getAddress());
            supplier.setCity(supplierDetails.getCity());
            supplier.setState(supplierDetails.getState());
            supplier.setPincode(supplierDetails.getPincode());
            supplier.setCountry(supplierDetails.getCountry());
            supplier.setContactPerson(supplierDetails.getContactPerson());
            supplier.setStatus(supplierDetails.getStatus());

            Supplier updatedSupplier = supplierRepository.save(supplier);
            return Optional.of(updatedSupplier);
        }
        return Optional.empty();
    }

    public boolean deleteSupplier(Long id) {

        Optional<Supplier> optionalSupplier = supplierRepository.findById(id);

        if (optionalSupplier.isPresent()) {
            supplierRepository.deleteById(id);
            return true;
        }
        return false;
    }
}