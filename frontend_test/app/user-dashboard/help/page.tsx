import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function UserHelp() {
  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold text-foreground">Help Center</h1>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about the Data Center Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How to look up device information?</AccordionTrigger>
              <AccordionContent>
                You can view all devices by clicking the "Device Lookup" option in the sidebar. On the device page, you
                can use the search box to search by name, model, or IP address. Click the "View Details" button to view
                the device's detailed information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to check service status?</AccordionTrigger>
              <AccordionContent>
                You can view the status of all services by clicking the "Service Status" option in the sidebar. A green
                marker indicates that the service is running normally, yellow indicates that it is under maintenance,
                and red indicates that the service is interrupted. Click the "View Details" button to view the service's
                detailed information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How to look up IP addresses?</AccordionTrigger>
              <AccordionContent>
                You can view all IP addresses by clicking the "IP Address Lookup" option in the sidebar. You can use the
                search box to search by IP address, subnet, or device name. You can also use the subnet filter to filter
                IP addresses for a specific subnet.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How to use global search?</AccordionTrigger>
              <AccordionContent>
                You can use the global search function by clicking the "Search" option in the sidebar. Enter keywords in
                the search box, and the system will search for matches in devices, services, and IP addresses. You can
                use the tab to switch between different types of results.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How to contact administrators?</AccordionTrigger>
              <AccordionContent>
                If you have any questions or need help, please send an email to admin@datacenter.com or call extension
                1234 to contact the data center administrator.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">If you need technical support, please contact us through:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Email: support@datacenter.com</li>
                <li>Internal Phone: 1234</li>
                <li>Working Hours: Monday to Friday 9:00-18:00</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentation Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">You can refer to the following documentation resources for more information:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>User Manual</li>
                <li>Device Catalog</li>
                <li>Network Topology Map</li>
                <li>Service Level Agreement (SLA)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
