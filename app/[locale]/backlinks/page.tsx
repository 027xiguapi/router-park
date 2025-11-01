"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  ExternalLink,
  ArrowUpDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import guestPostData from "@/public/guest_post_sites.json";

interface GuestPostSite {
  site_name: string;
  domain: string;
  niche_focus: string;
  submission_contributor_url: string;
  primary_contact: string;
  tailored_pitch_angle: string;
  Moz_DA_Ahrefs_DR_placeholder: string;
  editor_contact_name_placeholder: string;
  outreach_email_draft: string;
}

type SortField = "rank" | "domain" | "niche";
type SortDirection = "asc" | "desc";

export default function GuestPostsPage() {
  const t = useTranslations("pages.backlinks");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sites = guestPostData as GuestPostSite[];

  const sortedSites = useMemo(() => {
    const sorted = [...sites];
    sorted.sort((a, b) => {
      let compareA: string | number = "";
      let compareB: string | number = "";

      switch (sortField) {
        case "rank":
          compareA = sites.indexOf(a) + 1;
          compareB = sites.indexOf(b) + 1;
          break;
        case "domain":
          compareA = a.domain;
          compareB = b.domain;
          break;
        case "niche":
          compareA = a.niche_focus;
          compareB = b.niche_focus;
          break;
      }

      if (typeof compareA === "string" && typeof compareB === "string") {
        return sortDirection === "asc"
          ? compareA.localeCompare(compareB)
          : compareB.localeCompare(compareA);
      }

      return sortDirection === "asc"
        ? (compareA as number) - (compareB as number)
        : (compareB as number) - (compareA as number);
    });
    return sorted;
  }, [sites, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-2 hover:text-primary transition-colors"
    >
      {children}
      <ArrowUpDown className="h-4 w-4" />
    </button>
  );

  // 推荐徽章 - 前10名显示推荐
  const isRecommended = (index: number) => index < 10;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-4 text-lg font-semibold">
          <Info className="h-6 w-6" />
          <span>
            {t.rich('banner', {
              value1: (chunks) => <span className="text-yellow-300">{chunks}</span>,
              value2: (chunks) => <span className="text-yellow-300">{chunks}</span>,
              value3: (chunks) => <span className="text-yellow-300">{chunks}</span>,
            })}
          </span>
          <Info className="h-6 w-6" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title & Description */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('description')}
          </p>
        </div>

        {/* Social Share Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" />
            {t('shareButtons.email')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Twitter className="h-4 w-4" />
            {t('shareButtons.twitter')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Facebook className="h-4 w-4" />
            {t('shareButtons.facebook')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Linkedin className="h-4 w-4" />
            {t('shareButtons.linkedin')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('shareButtons.wechat')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            {t('shareButtons.telegram')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            {t('shareButtons.more')}
          </Button>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16 text-center">
                    <SortButton field="rank">{t('table.rank')}</SortButton>
                  </TableHead>
                  <TableHead className="w-24 text-center">{t('table.recommended')}</TableHead>
                  <TableHead className="min-w-[200px]">
                    <SortButton field="domain">{t('table.website')}</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="niche">{t('table.category')}</SortButton>
                  </TableHead>
                  <TableHead className="min-w-[300px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          {t('table.contentPositioning')}
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('table.contentPositioningTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead>{t('table.mainContact')}</TableHead>
                  <TableHead className="text-center">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSites.map((site, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell className="text-center font-medium">
                      {sites.indexOf(site) + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      {isRecommended(sites.indexOf(site)) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <ThumbsUp className="h-5 w-5 text-yellow-500 fill-yellow-500 mx-auto" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('table.highlyRecommended')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
                          alt={site.site_name}
                          className="w-5 h-5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23ddd'/%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <div className="font-medium">{site.site_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {site.domain}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{site.niche_focus}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {site.tailored_pitch_angle}
                    </TableCell>
                    <TableCell className="text-sm">
                      {site.primary_contact}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={site.submission_contributor_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('table.visitSubmissionPage')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{t('aboutTitle')}</h3>
          <p className="text-muted-foreground">
            {t('aboutDescription', { count: sites.length })}
          </p>
        </div>
      </div>
    </div>
  );
}
