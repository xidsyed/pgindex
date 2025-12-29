import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router'

import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AuthGuard } from "@/components/AuthGuard"
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { HomeScreen } from "@/routes/index"
import { UnitDetailsScreen } from "@/routes/unit"
import { AddUnitScreen } from "@/routes/add"
import { EditUnitScreen } from "@/routes/edit"




// Convex Client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Root Layout
const rootRoute = createRootRoute({
  component: () => (
    <ConvexProvider client={convex}>
      <AuthGuard>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
             <Outlet />
             <TanStackRouterDevtools />
        </div>
      </AuthGuard>
    </ConvexProvider>
  ),
})

// Index Route (Home)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeScreen,
})

// Add Unit Route
const addRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add',
  component: AddUnitScreen,
})

// Edit Unit Route
const editRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit/$unitId',
  component: EditUnitScreen,
})


// Details Route
const unitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unit/$unitId',
  component: UnitDetailsScreen,
})

// Create Router
const routeTree = rootRoute.addChildren([indexRoute, addRoute, editRoute, unitRoute])

const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />
}
