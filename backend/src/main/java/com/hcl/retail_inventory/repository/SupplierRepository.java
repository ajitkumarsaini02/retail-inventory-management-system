package com.hcl.retail_inventory.repository;

import com.hcl.retail_inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}