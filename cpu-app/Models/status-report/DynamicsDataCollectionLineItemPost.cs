using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Gov.Cscp.Victims.Public.Models
{
    public class DynamicsDataCollectionLineItemPost
    {
        public string fortunecookietype
        {
            get { return "#Microsoft.Dynamics.CRM.vsd_datacollectionlineitem"; }
        }
        public string vsd_name { get; set; }
        public string vsd_questioncategory { get; set; }
        public int vsd_number { get; set; }
        public int vsd_questiontype1 { get; set; }
        public int vsd_questionorder { get; set; }
        public string vsd_textanswer { get; set; }
        public int? vsd_yesno { get; set; }
    }
}
