package com.hcl.retail_inventory.repository;

import com.hcl.retail_inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yaml.snakeyaml.events.Event;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

}
