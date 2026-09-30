package com.hcl.retail_inventory.repository;

import com.hcl.retail_inventory.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

}