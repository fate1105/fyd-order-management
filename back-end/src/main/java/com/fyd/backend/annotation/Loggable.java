package com.fyd.backend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods that should be logged in activity_logs
 * Used with AOP to automatically capture CRUD operations
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable {
    /**
     * Action type: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
     */
    String action();
    
    /**
     * Entity type: Product, Order, Customer, User, etc.
     */
    String entityType();
}
